/**
 * @typedef {import('unified').Processor} Processor
 * @typedef {import('unified').PluggableList} PluggableList
 * @typedef {import('./plugin/recma-document.js').RecmaDocumentOptions} RecmaDocumentOptions
 * @typedef {import('./plugin/recma-stringify.js').RecmaStringifyOptions} RecmaStringifyOptions
 * @typedef {import('./plugin/recma-jsx-rewrite.js').RecmaJsxRewriteOptions} RecmaJsxRewriteOptions
 *
 * @typedef BaseProcessorOptions
 * @property {boolean} [jsx=false] Whether to keep JSX
 * @property {'mdx'|'md'} [format='mdx'] Format of the files to be processed
 * @property {'program'|'function-body'} [outputFormat='program'] Whether to compile to a whole program or a function body.
 * @property {string[]} [mdExtensions] Extensions (with `.`) for markdown
 * @property {string[]} [mdxExtensions] Extensions (with `.`) for MDX
 * @property {PluggableList} [recmaPlugins] List of recma (esast, JavaScript) plugins
 * @property {PluggableList} [remarkPlugins] List of remark (mdast, markdown) plugins
 * @property {PluggableList} [rehypePlugins] List of rehype (hast, HTML) plugins
 *
 * @typedef {Omit<RecmaDocumentOptions & RecmaStringifyOptions & RecmaJsxRewriteOptions, 'outputFormat'>} PluginOptions
 * @typedef {BaseProcessorOptions & PluginOptions} ProcessorOptions
 */

import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {recmaJsxBuild} from './plugin/recma-jsx-build.js'
import {recmaDocument} from './plugin/recma-document.js'
import {recmaJsxRewrite} from './plugin/recma-jsx-rewrite.js'
import {recmaStringify} from './plugin/recma-stringify.js'
import {rehypeRecma} from './plugin/rehype-recma.js'
import {rehypeRemoveRaw} from './plugin/rehype-remove-raw.js'
import {remarkMarkAndUnravel} from './plugin/remark-mark-and-unravel.js'
import {remarkMdx} from './plugin/remark-mdx.js'
import {nodeTypes} from './node-types.js'

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
    jsx,
    format,
    outputFormat,
    providerImportSource,
    recmaPlugins,
    rehypePlugins,
    remarkPlugins,
    SourceMapGenerator,
    ...rest
  } = options

  // @ts-expect-error runtime.
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
    .use(remarkRehype, {allowDangerousHtml: true, passThrough: nodeTypes})
    .use(rehypePlugins || [])

  if (format === 'md') {
    pipeline.use(rehypeRemoveRaw)
  }

  pipeline
    .use(rehypeRecma)
    .use(recmaDocument, {...rest, outputFormat})
    .use(recmaJsxRewrite, {providerImportSource, outputFormat})

  if (!jsx) {
    pipeline.use(recmaJsxBuild, {outputFormat})
  }

  pipeline.use(recmaStringify, {SourceMapGenerator}).use(recmaPlugins || [])

  return pipeline
}
