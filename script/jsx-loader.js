import fs from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {transform} from 'esbuild'

const {getFormat, load, transformSource} = createLoader()

export {getFormat, load, transformSource}

/**
 * A tiny JSX loader.
 */
export function createLoader() {
  return {load, getFormat, transformSource}

  // Node version 17.
  /**
   * @param {string} href
   * @param {unknown} context
   * @param {Function} defaultLoad
   */
  async function load(href, context, defaultLoad) {
    const url = new URL(href)

    if (!url.pathname.endsWith('.jsx')) {
      return defaultLoad(href, context, defaultLoad)
    }

    const {code, warnings} = await transform(String(await fs.readFile(url)), {
      format: 'esm',
      loader: 'jsx',
      sourcefile: fileURLToPath(url),
      sourcemap: 'both',
      target: 'esnext'
    })

    if (warnings) {
      for (const warning of warnings) {
        console.log(warning.location)
        console.log(warning.text)
      }
    }

    return {format: 'module', shortCircuit: true, source: code}
  }

  // Pre version 17.
  /**
   * @param {string} href
   * @param {unknown} context
   * @param {Function} defaultGetFormat
   */
  function getFormat(href, context, defaultGetFormat) {
    const url = new URL(href)

    return url.pathname.endsWith('.jsx')
      ? {format: 'module'}
      : defaultGetFormat(href, context, defaultGetFormat)
  }

  /**
   * @param {Buffer} value
   * @param {{url: string, [x: string]: unknown}} context
   * @param {Function} defaultTransformSource
   */
  async function transformSource(value, context, defaultTransformSource) {
    const url = new URL(context.url)

    if (!url.pathname.endsWith('.jsx')) {
      return defaultTransformSource(value, context, defaultTransformSource)
    }

    const {code, warnings} = await transform(String(value), {
      format: context.format === 'module' ? 'esm' : 'cjs',
      loader: 'jsx',
      sourcefile: fileURLToPath(url),
      sourcemap: 'both',
      target: 'esnext'
    })

    if (warnings) {
      for (const warning of warnings) {
        console.log(warning.location)
        console.log(warning.text)
      }
    }

    return {source: code}
  }
}
