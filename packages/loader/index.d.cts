// Some TS versions use this file, some `index.d.ts`.
type LoaderContext = import('webpack').LoaderContext<unknown>

declare function mdxLoader(this: LoaderContext, code: string): void
export = mdxLoader

export type Options = import('@mdx-js/mdx/lib/core.js').ProcessorOptions
