/**
 * @todo
 *   Land <https://github.com/DefinitelyTyped/DefinitelyTyped/pull/55809>
 *   for runtime-agnostic types.
 */

import type {ProcessorOptions} from '@mdx-js/mdx/lib/core.js'

type LoaderContext = import('webpack').LoaderContext<unknown>

declare module '*.mdx' {
  import {ComponentType} from 'react'

  const content: ComponentType
  export default content
}

/**
 * A Webpack loader to compile MDX to JavaScript.
 *
 * [Reference for Loader API](https://webpack.js.org/api/loaders/)
 *
 * @this {LoaderContext}
 * @param {string} value
 *   The original module source code.
 * @returns {void}
 */
declare function mdxLoader(this: LoaderContext, value: string): void

export default mdxLoader

export type Options = ProcessorOptions
