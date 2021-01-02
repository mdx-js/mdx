const unified = require('unified')
const remarkParse = require('remark-parse')
const remarkMdx = require('remark-mdx')
const squeeze = require('remark-squeeze-paragraphs')
const minifyWhitespace = require('rehype-minify-whitespace')
const mdxAstToMdxHast = require('./mdx-ast-to-mdx-hast')
const mdxHastToJsx = require('./mdx-hast-to-jsx')

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
  return String(createCompiler(options).processSync(createConfig(mdx, options)))
}

async function compile(mdx, options = {}) {
  return String(
    await createCompiler(options).process(createConfig(mdx, options))
  )
}

module.exports = compile
compile.default = compile
compile.sync = sync
compile.createMdxAstCompiler = createMdxAstCompiler
compile.createCompiler = createCompiler
