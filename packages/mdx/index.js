const unified = require('unified')
const remarkParse = require('remark-parse')
const remarkMdx = require('remark-mdx')
const squeeze = require('remark-squeeze-paragraphs')
const minifyWhitespace = require('rehype-minify-whitespace')
const mdxAstToMdxHast = require('./mdx-ast-to-mdx-hast')
const mdxHastToJsx = require('./mdx-hast-to-jsx')

const pragma = `/* @jsxRuntime classic */
/* @jsx mdx */
/* @jsxFrag mdx.Fragment */`

function createMdxAstCompiler(options = {}) {
  return unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(squeeze)
    .use(options.remarkPlugins)
    .use(mdxAstToMdxHast)
}

function createCompiler(options = {}) {
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

function sync(mdx, options = {}) {
  const file = createCompiler(options).processSync(createConfig(mdx, options))
  return pragma + '\n' + String(file)
}

async function compile(mdx, options = {}) {
  const file = await createCompiler(options).process(createConfig(mdx, options))
  return pragma + '\n' + String(file)
}

module.exports = compile
compile.default = compile
compile.sync = sync
compile.createMdxAstCompiler = createMdxAstCompiler
compile.createCompiler = createCompiler
