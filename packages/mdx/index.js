import unified from 'unified'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'
import squeeze from 'remark-squeeze-paragraphs'
import minifyWhitespace from 'rehype-minify-whitespace'
import mdxAstToMdxHast from './mdx-ast-to-mdx-hast'
import mdxHastToJsx from './mdx-hast-to-jsx'

const pragma = `/* @jsxRuntime classic */
/* @jsx mdx */
/* @jsxFrag mdx.Fragment */`

export function createMdxAstCompiler(options = {}) {
  return unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(squeeze)
    .use(options.remarkPlugins)
    .use(mdxAstToMdxHast)
}

export function createCompiler(options = {}) {
  return createMdxAstCompiler(options)
    .use(options.rehypePlugins)
    .use(minifyWhitespace, {newlines: true})
    .use(mdxHastToJsx, options)
}

function createConfig(mdx, options) {
  const config = {contents: mdx}

  if (options.filepath) {
    config.path = options.filepath
  }

  return config
}

export function sync(mdx, options = {}) {
  const file = createCompiler(options).processSync(createConfig(mdx, options))
  return pragma + '\n' + String(file)
}

export async function mdx(mdx, options = {}) {
  const file = await createCompiler(options).process(createConfig(mdx, options))
  return pragma + '\n' + String(file)
}
