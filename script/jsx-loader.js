import path from 'path'
import {fileURLToPath} from 'url'
import {transformSync} from 'esbuild'

const {getFormat, transformSource} = createLoader()

export {getFormat, transformSource}

/**
 * A tiny JSX loader.
 */
export function createLoader() {
  return {getFormat, transformSource}

  /**
   * @param {string} url
   * @param {unknown} context
   * @param {Function} defaultGetFormat
   */
  function getFormat(url, context, defaultGetFormat) {
    return path.extname(url) === '.jsx'
      ? {format: 'module'}
      : defaultGetFormat(url, context, defaultGetFormat)
  }

  /**
   * @param {Buffer} value
   * @param {{url: string, [x: string]: unknown}} context
   * @param {Function} defaultTransformSource
   */
  async function transformSource(value, context, defaultTransformSource) {
    if (path.extname(context.url) !== '.jsx') {
      return defaultTransformSource(value, context, defaultTransformSource)
    }

    const {code, warnings} = transformSync(String(value), {
      sourcefile: fileURLToPath(context.url),
      sourcemap: 'both',
      loader: 'jsx',
      target: 'esnext',
      format: context.format === 'module' ? 'esm' : 'cjs'
    })

    if (warnings && warnings.length > 0) {
      for (const warning of warnings) {
        console.log(warning.location)
        console.log(warning.text)
      }
    }

    return {source: code}
  }
}
