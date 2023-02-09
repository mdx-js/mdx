// Some TS versions use this file, some `index.d.cts`.
import type {ProcessorOptions} from '@mdx-js/mdx/lib/core.js'
import type {LoaderContext} from 'webpack'

/**
 * A Webpack loader to compile MDX to JavaScript.
 *
 * [Reference for Loader API](https://webpack.js.org/api/loaders/)
 *
 * @this {LoaderContext<unknown>}
 * @param {string} value
 *   The original module source code.
 * @returns {void}
 */
declare function mdxLoader(this: LoaderContext<unknown>, value: string): void

export default mdxLoader

export type Options = ProcessorOptions
