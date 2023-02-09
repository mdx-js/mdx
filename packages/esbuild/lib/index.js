/**
 * @typedef {import('esbuild').Plugin} Plugin
 * @typedef {import('esbuild').PluginBuild} PluginBuild
 * @typedef {import('esbuild').OnLoadArgs} OnLoadArgs
 * @typedef {import('esbuild').OnLoadResult} OnLoadResult
 * @typedef {import('esbuild').OnResolveArgs} OnResolveArgs
 * @typedef {import('esbuild').Message} Message
 * @typedef {import('vfile').VFileValue} VFileValue
 * @typedef {import('vfile-message').VFileMessage} VFileMessage
 * @typedef {import('@mdx-js/mdx/lib/core.js').ProcessorOptions} ProcessorOptions
 */

/**
 * @typedef {ProcessorOptions & {allowDangerousRemoteMdx?: boolean | null | undefined}} Options
 *   Configuration.
 */

import assert from 'node:assert'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import fetch from 'node-fetch'
import {VFile} from 'vfile'
import {createFormatAwareProcessors} from '@mdx-js/mdx/lib/util/create-format-aware-processors.js'
import {extnamesToRegex} from '@mdx-js/mdx/lib/util/extnames-to-regex.js'

const eol = /\r\n|\r|\n|\u2028|\u2029/g

/** @type Map<string, string> */
const cache = new Map()

const p = process

/**
 * Compile MDX w/ esbuild.
 *
 * @param {Options | null | undefined} [options]
 * @return {Plugin}
 */
export function esbuild(options) {
  const {allowDangerousRemoteMdx, ...rest} = options || {}
  const name = '@mdx-js/esbuild'
  const remoteNamespace = name + '-remote'
  const {extnames, process} = createFormatAwareProcessors(rest)

  return {name, setup}

  /**
   * @param {PluginBuild} build
   */
  function setup(build) {
    const filter = extnamesToRegex(extnames)
    /* eslint-disable-next-line security/detect-non-literal-regexp */
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

    /** @param {OnResolveArgs} args  */
    function resolveRemoteInLocal(args) {
      return {path: args.path, namespace: remoteNamespace}
    }

    // Intercept all import paths inside downloaded files and resolve them against
    // the original URL. All of these
    // files will be in the "http-url" namespace. Make sure to keep
    // the newly resolved URL in the "http-url" namespace so imports
    // inside it will also be resolved as URLs recursively.
    /** @param {OnResolveArgs} args  */
    function resolveInRemote(args) {
      return {
        path: String(new URL(args.path, args.importer)),
        namespace: remoteNamespace
      }
    }

    /**
     * @param {OnLoadArgs} data
     * @returns {Promise<OnLoadResult>}
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
        contents = await (await fetch(href)).text()
        cache.set(href, contents)
      }

      return filter.test(href)
        ? onload({
            suffix: '',
            // Clean search and hash from URL.
            path: Object.assign(new URL(href), {search: '', hash: ''}).href,
            namespace: 'file',
            pluginData: {contents}
          })
        : {contents, loader: 'js', resolveDir: p.cwd()}
    }

    /**
     * @param {Omit<OnLoadArgs, 'pluginData'> & {pluginData?: {contents?: Buffer | string | null | undefined}}} data
     * @returns {Promise<OnLoadResult>}
     */
    async function onload(data) {
      /** @type {string} */
      const doc = String(
        data.pluginData &&
          data.pluginData.contents !== null &&
          data.pluginData.contents !== undefined
          ? data.pluginData.contents
          : /* eslint-disable-next-line security/detect-non-literal-fs-filename */
            await fs.readFile(data.path)
      )

      let file = new VFile({value: doc, path: data.path})
      /** @type {VFileValue | undefined} */
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
        const location = 'position' in message ? message.position : undefined
        const start = location ? location.start : undefined
        const end = location ? location.end : undefined
        let length = 0
        let lineStart = 0
        let line = 0
        let column = 0

        if (
          start &&
          start.line !== null &&
          start.line !== undefined &&
          start.column !== undefined &&
          start.column !== null &&
          start.offset !== undefined &&
          start.offset !== null
        ) {
          line = start.line
          column = start.column - 1
          lineStart = start.offset - column
          length = 1

          if (
            end &&
            end.line !== null &&
            end.line !== undefined &&
            end.column !== undefined &&
            end.column !== null &&
            end.offset !== undefined &&
            end.offset !== null
          ) {
            length = end.offset - start.offset
          }
        }

        eol.lastIndex = lineStart

        const match = eol.exec(doc)
        const lineEnd = match ? match.index : doc.length

        ;(!('fatal' in message) || message.fatal ? errors : warnings).push({
          pluginName: name,
          id: '',
          text:
            'reason' in message
              ? message.reason
              : /* Extra fallback to make sure weird values are definitely strings */
                /* c8 ignore next */
                message.stack || String(message),
          notes: [],
          location: {
            namespace: 'file',
            suggestion: '',
            file: data.path,
            line,
            column,
            length: Math.min(length, lineEnd),
            lineText: doc.slice(lineStart, lineEnd)
          },
          detail: message
        })
      }

      // Safety check: the file has a path, so there has to be a `dirname`.
      assert(file.dirname, 'expected `dirname` to be defined')

      return {
        contents: value || '',
        errors,
        warnings,
        resolveDir: http.test(file.path)
          ? p.cwd()
          : path.resolve(file.cwd, file.dirname)
      }
    }
  }
}
