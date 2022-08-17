import {promises as fs} from 'node:fs'
import path from 'node:path'
import {URL, fileURLToPath} from 'node:url'
import {transform, transformSync} from 'esbuild'

const {load, getFormat, transformSource} = createLoader()

export {load, getFormat, transformSource}

/**
 * A tiny JSX loader.
 */
export function createLoader() {
  return {load, getFormat, transformSource}

  // Node version 17.
  /**
   * @param {string} url
   * @param {unknown} context
   * @param {Function} defaultLoad
   */
  async function load(url, context, defaultLoad) {
    if (path.extname(url) !== '.jsx') {
      return defaultLoad(url, context, defaultLoad)
    }

    const fp = fileURLToPath(new URL(url))
    const value = await fs.readFile(fp)

    const {code, warnings} = await transform(String(value), {
      sourcefile: fp,
      sourcemap: 'both',
      loader: 'jsx',
      target: 'esnext',
      format: 'esm'
    })

    if (warnings && warnings.length > 0) {
      for (const warning of warnings) {
        console.log(warning.location)
        console.log(warning.text)
      }
    }

    return {format: 'module', source: code}
  }

  // Pre version 17.
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
