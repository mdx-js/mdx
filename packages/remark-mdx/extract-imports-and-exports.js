const {transformSync} = require('@babel/core')

const syntaxJsxPlugin = require('@babel/plugin-syntax-jsx')
const proposalObjectRestSpreadPlugin = require('@babel/plugin-proposal-object-rest-spread')
const BabelPluginExtractImportsAndExports = require('babel-plugin-extract-imports-and-exports')

module.exports = (value, vfile) => {
  const instance = new BabelPluginExtractImportsAndExports()

  transformSync(value, {
    plugins: [syntaxJsxPlugin, proposalObjectRestSpreadPlugin, instance.plugin],
    filename: vfile.path,
    configFile: false,
    babelrc: false
  })

  return instance.state.nodes.map(node => ({
    ...(node.default && {default: node.default}),
    type: node.type,
    value: value.substr(node.start, node.end - node.start)
  }))
}
