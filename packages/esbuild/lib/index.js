/**
 * @import {CompileOptions} from '@mdx-js/mdx'
 * @import {
      Location,
      Message,
      OnLoadArgs,
      OnLoadResult,
      Plugin,
      PluginBuild
 * } from 'esbuild'
 */

/**
 * @typedef {Omit<OnLoadArgs, 'pluginData'> & LoadDataFields} LoadData
 *   Data passed to `onload`.
 *
 * @typedef LoadDataFields
 *   Extra fields given in `data` to `onload`.
 * @property {PluginData | null | undefined} [pluginData]
 *   Plugin data.
 *
 * @typedef {CompileOptions} Options
 *   Configuration.
 *
 *   Options are the same as `compile` from `@mdx-js/mdx`.
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
import {createFormatAwareProcessors} from '@mdx-js/mdx/internal-create-format-aware-processors'
import {extnamesToRegex} from '@mdx-js/mdx/internal-extnames-to-regex'
import {SourceMapGenerator} from 'source-map'
import {VFile} from 'vfile'
import {VFileMessage} from 'vfile-message'

const eol = /\r\n|\r|\n|\u2028|\u2029/g

const name = '@mdx-js/esbuild'

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
  const settings = {...options, SourceMapGenerator}
  const {extnames, process} = createFormatAwareProcessors(settings)

  return {name, setup}

  /**
   * @param {PluginBuild} build
   *   Build.
   * @returns {undefined}
   *   Nothing.
   */
  function setup(build) {
    build.onLoad({filter: extnamesToRegex(extnames)}, onload)

    /**
     * @param {LoadData} data
     *   Data.
     * @returns {Promise<OnLoadResult>}
     *   Result.
     */
    async function onload(data) {
      const document = String(
        data.pluginData &&
          data.pluginData.contents !== null &&
          data.pluginData.contents !== undefined
          ? data.pluginData.contents
          : await fs.readFile(data.path)
      )

      /** @type {State} */
      const state = {doc: document, name, path: data.path}
      let file = new VFile({path: data.path, value: document})
      /** @type {string | undefined} */
      let value
      /** @type {Array<VFileMessage>} */
      let messages = []
      /** @type {Array<Message>} */
      const errors = []
      /** @type {Array<Message>} */
      const warnings = []

      try {
        file = await process(file)
        value =
          String(file.value) +
          '\n//# sourceMappingURL=data:application/json;base64,' +
          Buffer.from(JSON.stringify(file.map)).toString('base64') +
          '\n'
        messages = file.messages
      } catch (error_) {
        const place = typeof error_.reason === 'string' && error_.place
        const message =
          new VFileMessage(
            `Cannot process MDX file with esbuild:\n  ${error_}`, {
            cause: error_,
            place,
            ruleId: 'process-error',
            source: '@mdx-js/esbuild'
          })
        message.fatal = true
        messages.push(message)
      }

      for (const message of messages) {
        const list = message.fatal ? errors : warnings
        list.push(vfileMessageToEsbuild(state, message))
      }

      // Safety check: the file has a path, so there has to be a `dirname`.
      assert(file.dirname, 'expected `dirname` to be defined')

      return {
        contents: value || '',
        errors,
        loader: settings.jsx ? 'jsx' : 'js',
        resolveDir: path.resolve(file.cwd, file.dirname),
        warnings
      }
    }
  }
}

/**
 * @param {Readonly<State>} state
 *   Info passed around.
 * @param {Readonly<VFileMessage>} message
 *   VFile message or error.
 * @returns {Message}
 *   ESBuild message.
 */
function vfileMessageToEsbuild(state, message) {
  /** @type {Location} */
  let location = {
    column: 0,
    file: state.path,
    length: 0,
    line: 0,
    lineText: '',
    namespace: 'file',
    suggestion: '',
  }

  const place = message.place
  const start = place ? ('start' in place ? place.start : place) : undefined
  if (start) {
    location.column = start.column - 1
    location.line = start.line
    location.length = 1

    const end = place && 'end' in place ? place.end : undefined
    if (end) {
      if (end.offset >= start.offset) {
        location.length = end.offset - start.offset;
      } else if (end.line == start.line) {
        location.length = end.column - start.column;
      }

      const maxLength = state.doc.length - (start.offset || 0)
      location.length = Math.min(location.length, maxLength)
    }

    if (start.offset !== undefined) {
      eol.lastIndex = start.offset
      const match = eol.exec(state.doc)
      const lineStart = start.offset - (start.column - 1)
      const lineEnd = match ? match.index : state.doc.length
      location.lineText = state.doc.slice(lineStart, lineEnd)

      location.length = Math.min(location.length, lineEnd - (start.offset || 0))
    }
  }

  return {
    detail: message,
    id: '',
    location,
    notes: [],
    pluginName: state.name,
    text: message.reason
  }
}
