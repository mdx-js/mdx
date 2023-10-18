/**
 * @typedef {import('estree-jsx').Program} Program
 * @typedef {import('mdast').Root} Root
 * @typedef {import('remark-rehype').Options} RemarkRehypeOptions
 * @typedef {import('unified').PluggableList} PluggableList
 * @typedef {import('unified').Processor<Root, Program, Program, Program, string>} Processor
 * @typedef {import('./plugin/recma-document.js').Options} RecmaDocumentOptions
 * @typedef {import('./plugin/recma-jsx-rewrite.js').Options} RecmaJsxRewriteOptions
 * @typedef {import('./plugin/recma-stringify.js').Options} RecmaStringifyOptions
 * @typedef {import('./plugin/rehype-recma.js').Options} RehypeRecmaOptions
 */

/**
 * @typedef BaseProcessorOptions
 *   Base configuration.
 * @property {boolean | null | undefined} [jsx=false]
 *   Whether to keep JSX (default: `false`).
 * @property {'md' | 'mdx' | null | undefined} [format='mdx']
 *   Format of the files to be processed (default: `'mdx'`).
 * @property {'function-body' | 'program'} [outputFormat='program']
 *   Whether to compile to a whole program or a function body (default:
 *   `'program'`).
 * @property {ReadonlyArray<string> | null | undefined} [mdExtensions]
 *   Extensions (with `.`) for markdown (default: `['.md', '.markdown', …]`).
 * @property {ReadonlyArray<string> | null | undefined} [mdxExtensions]
 *   Extensions (with `.`) for MDX (default: `['.mdx']`).
 * @property {PluggableList | null | undefined} [recmaPlugins]
 *   List of recma (esast, JavaScript) plugins (optional).
 * @property {PluggableList | null | undefined} [remarkPlugins]
 *   List of remark (mdast, markdown) plugins (optional).
 * @property {PluggableList | null | undefined} [rehypePlugins]
 *   List of rehype (hast, HTML) plugins (optional).
 * @property {Readonly<RemarkRehypeOptions> | null | undefined} [remarkRehypeOptions]
 *   Options to pass through to `remark-rehype` (optional).
 *
 * @typedef {Omit<RecmaDocumentOptions & RecmaJsxRewriteOptions & RecmaStringifyOptions & RehypeRecmaOptions, 'outputFormat'>} PluginOptions
 *   Configuration for internal plugins.
 *
 * @typedef {BaseProcessorOptions & PluginOptions} ProcessorOptions
 *   Configuration for processor.
 */

import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {unified} from 'unified'
import {recmaDocument} from './plugin/recma-document.js'
import {recmaJsxBuild} from './plugin/recma-jsx-build.js'
import {recmaJsxRewrite} from './plugin/recma-jsx-rewrite.js'
import {recmaStringify} from './plugin/recma-stringify.js'
import {rehypeRecma} from './plugin/rehype-recma.js'
import {rehypeRemoveRaw} from './plugin/rehype-remove-raw.js'
import {remarkMarkAndUnravel} from './plugin/remark-mark-and-unravel.js'
import {nodeTypes} from './node-types.js'
import {development as defaultDevelopment} from '#condition'

const removedOptions = [
  'compilers',
  'filepath',
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
 * @param {Readonly<ProcessorOptions> | null | undefined} [options]
 *   Configuration (optional).
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

  // @ts-expect-error: throw an error for a runtime value which is not allowed
  // by the types.
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
    ? remarkRehypeOptions.passThrough || []
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

  // @ts-expect-error: we added plugins with if-checks, which TS doesn’t get.
  return pipeline
}
