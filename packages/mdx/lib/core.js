/**
 * @typedef {import('remark-rehype').Options} RemarkRehypeOptions
 * @typedef {import('unified').PluggableList} PluggableList
 * @typedef {import('unified').Processor} Processor
 * @typedef {import('./plugin/rehype-recma.js').Options} RehypeRecmaOptions
 * @typedef {import('./plugin/recma-document.js').RecmaDocumentOptions} RecmaDocumentOptions
 * @typedef {import('./plugin/recma-stringify.js').RecmaStringifyOptions} RecmaStringifyOptions
 * @typedef {import('./plugin/recma-jsx-rewrite.js').RecmaJsxRewriteOptions} RecmaJsxRewriteOptions
 */

/**
 * @typedef BaseProcessorOptions
 *   Base configuration.
 * @property {boolean | null | undefined} [jsx=false]
 *   Whether to keep JSX.
 * @property {'mdx' | 'md' | null | undefined} [format='mdx']
 *   Format of the files to be processed.
 * @property {'function-body' | 'program'} [outputFormat='program']
 *   Whether to compile to a whole program or a function body..
 * @property {Array<string> | null | undefined} [mdExtensions]
 *   Extensions (with `.`) for markdown.
 * @property {Array<string> | null | undefined} [mdxExtensions]
 *   Extensions (with `.`) for MDX.
 * @property {PluggableList | null | undefined} [recmaPlugins]
 *   List of recma (esast, JavaScript) plugins.
 * @property {PluggableList | null | undefined} [remarkPlugins]
 *   List of remark (mdast, markdown) plugins.
 * @property {PluggableList | null | undefined} [rehypePlugins]
 *   List of rehype (hast, HTML) plugins.
 * @property {RemarkRehypeOptions | null | undefined} [remarkRehypeOptions]
 *   Options to pass through to `remark-rehype`.
 *
 * @typedef {Omit<RehypeRecmaOptions & RecmaDocumentOptions & RecmaStringifyOptions & RecmaJsxRewriteOptions, 'outputFormat'>} PluginOptions
 *   Configuration for internal plugins.
 *
 * @typedef {BaseProcessorOptions & PluginOptions} ProcessorOptions
 *   Configuration for processor.
 */

import {unified} from 'unified'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {recmaJsxBuild} from './plugin/recma-jsx-build.js'
import {recmaDocument} from './plugin/recma-document.js'
import {recmaJsxRewrite} from './plugin/recma-jsx-rewrite.js'
import {recmaStringify} from './plugin/recma-stringify.js'
import {rehypeRecma} from './plugin/rehype-recma.js'
import {rehypeRemoveRaw} from './plugin/rehype-remove-raw.js'
import {remarkMarkAndUnravel} from './plugin/remark-mark-and-unravel.js'
import {nodeTypes} from './node-types.js'
import {development as defaultDevelopment} from './condition.js'

const removedOptions = [
  'filepath',
  'compilers',
  'hastPlugins',
  'mdPlugins',
  'skipExport',
  'wrapExport'
]

/**
 * Pipeline to:
 *
 * 1. Parse MDX (serialized markdown with embedded JSX, ESM, and  expressions)
 * 2. Transform through remark (mdast), rehype (hast), and recma (esast)
 * 3. Serialize as JavaScript
 *
 * @param {ProcessorOptions | null | undefined} [options]
 *   Configuration.
 * @return {Processor}
 *   Processor.
 */
export function createProcessor(options) {
  const {
    development,
    jsx,
    format,
    outputFormat,
    providerImportSource,
    recmaPlugins,
    rehypePlugins,
    remarkPlugins,
    remarkRehypeOptions,
    elementAttributeNameCase,
    stylePropertyNameCase,
    SourceMapGenerator,
    ...rest
  } = options || {}
  const dev =
    development === null || development === undefined
      ? defaultDevelopment
      : development
  let index = -1

  while (++index < removedOptions.length) {
    const key = removedOptions[index]
    if (options && key in options) {
      throw new Error(
        '`options.' +
          key +
          '` is no longer supported. Please see <https://mdxjs.com/migrating/v2/> for more information'
      )
    }
  }

  // @ts-expect-error runtime exception for disallowed field here, which is
  // allowed in `compile`.
  if (format === 'detect') {
    throw new Error(
      "Incorrect `format: 'detect'`: `createProcessor` can support either `md` or `mdx`; it does not support detecting the format"
    )
  }

  const pipeline = unified().use(remarkParse)

  if (format !== 'md') {
    pipeline.use(remarkMdx)
  }

  const extraNodeTypes = remarkRehypeOptions
    ? /* c8 ignore next */
      remarkRehypeOptions.passThrough || []
    : []

  pipeline
    .use(remarkMarkAndUnravel)
    .use(remarkPlugins || [])
    .use(remarkRehype, {
      ...remarkRehypeOptions,
      allowDangerousHtml: true,
      passThrough: [...extraNodeTypes, ...nodeTypes]
    })
    .use(rehypePlugins || [])

  if (format === 'md') {
    pipeline.use(rehypeRemoveRaw)
  }

  pipeline
    .use(rehypeRecma, {elementAttributeNameCase, stylePropertyNameCase})
    .use(recmaDocument, {...rest, outputFormat})
    .use(recmaJsxRewrite, {
      development: dev,
      providerImportSource,
      outputFormat
    })

  if (!jsx) {
    pipeline.use(recmaJsxBuild, {development: dev, outputFormat})
  }

  pipeline.use(recmaStringify, {SourceMapGenerator}).use(recmaPlugins || [])

  return pipeline
}
