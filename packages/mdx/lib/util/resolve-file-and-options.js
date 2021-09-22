/**
 * @typedef {import('vfile').VFileCompatible} VFileCompatible
 * @typedef {import('../core.js').ProcessorOptions} ProcessorOptions
 * @typedef {import('../compile.js').CompileOptions} CompileOptions
 */

import {VFile} from 'vfile'
import {md} from './extnames.js'

/**
 * Create a file and options from a given `vfileCompatible` and options that
 * might contain `format: 'detect'`.
 *
 * @param {VFileCompatible} vfileCompatible
 * @param {CompileOptions} [options]
 * @returns {{file: VFile, options: ProcessorOptions}}
 */
export function resolveFileAndOptions(vfileCompatible, options) {
  const file = looksLikeAVFile(vfileCompatible)
    ? vfileCompatible
    : new VFile(vfileCompatible)
  const {format, ...rest} = options || {}
  return {
    file,
    options: {
      format:
        format === 'md' || format === 'mdx'
          ? format
          : file.extname && (rest.mdExtensions || md).includes(file.extname)
          ? 'md'
          : 'mdx',
      ...rest
    }
  }
}

/**
 * @param {VFileCompatible} [value]
 * @returns {value is VFile}
 */
function looksLikeAVFile(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'message' in value &&
      'messages' in value
  )
}
