/**
 * @typedef {import('@mdx-js/mdx').ProcessorOptions} ProcessorOptions
 * @typedef {import('esbuild').Message} Message
 * @typedef {import('esbuild').OnLoadArgs} OnLoadArgs
 * @typedef {import('esbuild').OnLoadResult} OnLoadResult
 * @typedef {import('esbuild').OnResolveArgs} OnResolveArgs
 * @typedef {import('esbuild').Plugin} Plugin
 * @typedef {import('esbuild').PluginBuild} PluginBuild
 * @typedef {import('vfile').Value} Value
 * @typedef {import('vfile-message').VFileMessage} VFileMessage
 */

/**
 * @typedef EsbuildOptions
 *   Extra options.
 * @property {boolean | null | undefined} [allowDangerousRemoteMdx=false]
 *   Whether to allow importing from `http:` and `https:` URLs (`boolean`,
 *   default: `false`).
 *
 *   When passing `allowDangerousRemoteMdx`, MD(X) *and* JS files can be
 *   imported from `http:` and `https:` urls.
 *
 * @typedef {Omit<OnLoadArgs, 'pluginData'> & LoadDataFields} LoadData
 *   Data passed to `onload`.
 *
 * @typedef LoadDataFields
 *   Extra fields given in `data` to `onload`.
 * @property {PluginData | null | undefined} [pluginData]
 *   Plugin data.
 *
 * @typedef {EsbuildOptions & ProcessorOptions} Options
 *   Configuration.
 *
 *   Options are the same as `compile` from `@mdx-js/mdx` with the addition
 *   of `allowDangerousRemoteMdx`.
 *
 *   ###### Notes
 *
 *   > ⚠️ **Security**: `allowDangerousRemoteMdx` (intentionally) enabled remote
 *   > code execution.
 *   > Make sure you trust your code!
 *   > See [§ Security][security] for more
 *   > info.
 *
 *   > 💡 **Experiment**: `allowDangerousRemoteMdx` is an experimental feature
 *   > that might not work well and might change in minor releases.
 *
 * @typedef PluginData
 *   Extra data passed.
 * @property {Buffer | string | null | undefined} [contents]
 *   File contents.
 *
 * @typedef State
 *   Info passed around.
 * @property {string} doc
 *   File value.
 * @property {string} name
 *   Plugin name.
 * @property {string} path
 *   File path.
 */

import assert from 'node:assert'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import {createFormatAwareProcessors} from '@mdx-js/mdx/internal-create-format-aware-processors'
import {extnamesToRegex} from '@mdx-js/mdx/internal-extnames-to-regex'
import {fetch} from 'undici'
import {VFile} from 'vfile'

const eol = /\r\n|\r|\n|\u2028|\u2029/g

/** @type {Map<string, string>} */
const cache = new Map()
const name = '@mdx-js/esbuild'
const p = process
const remoteNamespace = name + '-remote'

/**
 * Create an esbuild plugin to compile MDX to JS.
 *
 * esbuild takes care of turning modern JavaScript features into syntax that
 * works wherever you want it to.
 * With other integrations you might need to use Babel for this, but with
 * esbuild that’s not needed.
 * See esbuild’s docs for more info.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @return {Plugin}
 *   Plugin.
 */
export function esbuild(options) {
  const {allowDangerousRemoteMdx, ...rest} = options || {}
  const {extnames, process} = createFormatAwareProcessors(rest)

  return {name, setup}

  /**
   * @param {PluginBuild} build
   *   Build.
   * @returns {undefined}
   *   Nothing.
   */
  function setup(build) {
    const filter = extnamesToRegex(extnames)
    const filterHttp = new RegExp('^https?:\\/{2}.+' + filter.source)
    const http = /^https?:\/{2}/
    const filterHttpOrRelative = /^(https?:\/{2}|.{1,2}\/).*/

    if (allowDangerousRemoteMdx) {
      // Intercept import paths starting with "http:" and "https:" so
      // esbuild doesn't attempt to map them to a file system location.
      // Tag them with the "http-url" namespace to associate them with
      // this plugin.
      build.onResolve(
        {filter: filterHttp, namespace: 'file'},
        resolveRemoteInLocal
      )

      build.onResolve(
        {filter: filterHttpOrRelative, namespace: remoteNamespace},
        resolveInRemote
      )
    }

    build.onLoad({filter: /.*/, namespace: remoteNamespace}, onloadremote)
    build.onLoad({filter}, onload)

    /** @param {OnResolveArgs} args */
    function resolveRemoteInLocal(args) {
      return {namespace: remoteNamespace, path: args.path}
    }

    // Intercept all import paths inside downloaded files and resolve them against
    // the original URL. All of these
    // files will be in the "http-url" namespace. Make sure to keep
    // the newly resolved URL in the "http-url" namespace so imports
    // inside it will also be resolved as URLs recursively.
    /** @param {OnResolveArgs} args */
    function resolveInRemote(args) {
      return {
        namespace: remoteNamespace,
        path: String(new URL(args.path, args.importer))
      }
    }

    /**
     * @param {OnLoadArgs} data
     *   Data.
     * @returns {Promise<OnLoadResult>}
     *   Result.
     */
    async function onloadremote(data) {
      const href = data.path
      console.log('%s: downloading `%s`', remoteNamespace, href)

      /** @type {string} */
      let contents

      const cachedContents = cache.get(href)
      if (cachedContents) {
        contents = cachedContents
      } else {
        const response = await fetch(href)
        contents = await response.text()
        cache.set(href, contents)
      }

      if (filter.test(href)) {
        // Clean search and hash from URL.
        const url = new URL(href)
        url.hash = ''
        url.search = ''
        return onload({
          namespace: 'file',
          path: url.href,
          pluginData: {contents},
          suffix: ''
        })
      }

      return {contents, loader: 'js', resolveDir: p.cwd()}
    }

    /**
     * @param {LoadData} data
     *   Data.
     * @returns {Promise<OnLoadResult>}
     *   Result.
     */
    async function onload(data) {
      const doc = String(
        data.pluginData &&
          data.pluginData.contents !== null &&
          data.pluginData.contents !== undefined
          ? data.pluginData.contents
          : await fs.readFile(data.path)
      )

      /** @type {State} */
      const state = {doc, name, path: data.path}
      let file = new VFile({path: data.path, value: doc})
      /** @type {Value | undefined} */
      let value
      /** @type {Array<Error | VFileMessage>} */
      let messages = []
      /** @type {Array<Message>} */
      const errors = []
      /** @type {Array<Message>} */
      const warnings = []

      try {
        file = await process(file)
        value = file.value
        messages = file.messages
      } catch (error_) {
        const error = /** @type {Error | VFileMessage} */ (error_)
        if ('fatal' in error) error.fatal = true
        messages.push(error)
      }

      for (const message of messages) {
        const list = !('fatal' in message) || message.fatal ? errors : warnings
        list.push(vfileMessageToEsbuild(state, message))
      }

      // Safety check: the file has a path, so there has to be a `dirname`.
      assert(file.dirname, 'expected `dirname` to be defined')

      return {
        contents: value || '',
        errors,
        resolveDir: http.test(file.path)
          ? p.cwd()
          : path.resolve(file.cwd, file.dirname),
        warnings
      }
    }
  }
}

/**
 * @param {Readonly<State>} state
 *   Info passed around.
 * @param {Readonly<Error | VFileMessage>} message
 *   VFile message or error.
 * @returns {Message}
 *   ESBuild message.
 */
function vfileMessageToEsbuild(state, message) {
  const place = 'place' in message ? message.place : undefined
  const start = place ? ('start' in place ? place.start : place) : undefined
  const end = place && 'end' in place ? place.end : undefined
  let length = 0
  let lineStart = 0
  let line = 0
  let column = 0

  if (start && start.offset !== undefined) {
    line = start.line
    column = start.column - 1
    lineStart = start.offset - column
    length = 1

    if (end && end.offset !== undefined) {
      length = end.offset - start.offset
    }
  }

  eol.lastIndex = lineStart

  const match = eol.exec(state.doc)
  const lineEnd = match ? match.index : state.doc.length

  return {
    detail: message,
    id: '',
    location: {
      column,
      file: state.path,
      length: Math.min(length, lineEnd),
      line,
      lineText: state.doc.slice(lineStart, lineEnd),
      namespace: 'file',
      suggestion: ''
    },
    notes: [],
    pluginName: state.name,
    text: String(
      ('reason' in message ? message.reason : undefined) ||
        /* c8 ignore next 2 - errors should have stacks */
        message.stack ||
        message
    )
  }
}
