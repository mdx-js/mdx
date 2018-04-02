const unified = require('unified')
const toMDAST = require('remark-parse')
const squeeze = require('remark-squeeze-paragraphs')
const images = require('remark-images')
const toMDXAST = require('@mdx-js/mdxast')
const mdxAstToMdxHast = require('./mdx-ast-to-mdx-hast')
const mdxHastToJsx = require('./mdx-hast-to-jsx')

function createMdxAstCompiler(options = {}) {
  const mdPlugins = options.mdPlugins || []

  options.blocks = options.blocks || ['[a-z]+(\\.){0,1}[a-z]']

  const fn = unified()
    .use(toMDAST, options)
    .use(images, options)
    .use(squeeze, options)

  mdPlugins.forEach(plugin => fn.use(plugin, options))

  fn
    .use(toMDXAST, options)
    .use(mdxAstToMdxHast, options)

  return fn
}

async function compile(mdx, options = {}) {
  // TODO: v1 change
  // For now let's also default old plugins key to hastPlugins so this
  // api change isn't breaking until v1.
  const hastPlugins = options.hastPlugins || options.plugins || []
  if (options.plugins) {
    console.log('MDX DEPRECATION: options.plugins is no longer supported please see the latest plugin api docs')
    console.log('https://github.com/mdx-js/mdx#options')
  }

  const compilers = options.compilers || []

  const fn = createMdxAstCompiler(options)

  hastPlugins.forEach(plugin => fn.use(plugin, options))

  fn.use(mdxHastToJsx, options)

  compilers.forEach(compiler => fn.use(compiler, options))

  const { contents } = await fn.process(mdx)

  return contents
}

module.exports = compile
exports = compile
exports.createMdxAstCompiler = createMdxAstCompiler
exports.default = compile
