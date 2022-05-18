/**
 * @typedef {import('unified').Processor} Processor
 * @typedef {import('unified').PluggableList} PluggableList
 * @typedef {import('./plugin/recma-document.js').RecmaDocumentOptions} RecmaDocumentOptions
 * @typedef {import('./plugin/recma-stringify.js').RecmaStringifyOptions} RecmaStringifyOptions
 * @typedef {import('./plugin/recma-jsx-rewrite.js').RecmaJsxRewriteOptions} RecmaJsxRewriteOptions
 * @typedef {import('remark-rehype').Options} RemarkRehypeOptions
 *
 * @typedef BaseProcessorOptions
 * @property {boolean} [jsx=false]
 *   Whether to keep JSX.
 * @property {'mdx'|'md'} [format='mdx']
 *   Format of the files to be processed.
 * @property {'program'|'function-body'} [outputFormat='program']
 *   Whether to compile to a whole program or a function body..
 * @property {Array<string>} [mdExtensions]
 *   Extensions (with `.`) for markdown.
 * @property {Array<string>} [mdxExtensions]
 *   Extensions (with `.`) for MDX.
 * @property {PluggableList} [recmaPlugins]
 *   List of recma (esast, JavaScript) plugins.
 * @property {PluggableList} [remarkPlugins]
 *   List of remark (mdast, markdown) plugins.
 * @property {PluggableList} [rehypePlugins]
 *   List of rehype (hast, HTML) plugins.
 * @property {RemarkRehypeOptions} [remarkRehypeOptions]
 *   Options to pass through to `remark-rehype`.
 *
 * @typedef {Omit<RecmaDocumentOptions & RecmaStringifyOptions & RecmaJsxRewriteOptions, 'outputFormat'>} PluginOptions
 * @typedef {BaseProcessorOptions & PluginOptions} ProcessorOptions
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
 * @param {ProcessorOptions} [options]
 * @return {Processor}
 */
export function createProcessor(options = {}) {
  const {
    development = defaultDevelopment,
    jsx,
    format,
    outputFormat,
    providerImportSource,
    recmaPlugins,
    rehypePlugins,
    remarkPlugins,
    remarkRehypeOptions = {},
    SourceMapGenerator,
    ...rest
  } = options
  let index = -1

  while (++index < removedOptions.length) {
    const key = removedOptions[index]
    if (key in options) {
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

  pipeline
    .use(remarkMarkAndUnravel)
    .use(remarkPlugins || [])
    .use(remarkRehype, {
      ...remarkRehypeOptions,
      allowDangerousHtml: true,
      /* c8 ignore next */
      passThrough: [...(remarkRehypeOptions.passThrough || []), ...nodeTypes]
    })
    .use(rehypePlugins || [])

  if (format === 'md') {
    pipeline.use(rehypeRemoveRaw)
  }

  pipeline
    .use(rehypeRecma)
    .use(recmaDocument, {...rest, outputFormat})
    .use(recmaJsxRewrite, {development, providerImportSource, outputFormat})

  if (!jsx) {
    pipeline.use(recmaJsxBuild, {development, outputFormat})
  }

  pipeline.use(recmaStringify, {SourceMapGenerator}).use(recmaPlugins || [])

  return pipeline
}
