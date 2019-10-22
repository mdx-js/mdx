const {transformSync} = require('@babel/core')
const declare = require('@babel/helper-plugin-utils').declare

const syntaxJsxPlugin = require('@babel/plugin-syntax-jsx')
const proposalObjectRestSpreadPlugin = require('@babel/plugin-proposal-object-rest-spread')

class BabelPluginExtractImportsAndExports {
  constructor() {
    const nodes = []
    this.state = {nodes}

    this.plugin = declare(api => {
      api.assertVersion(7)

      return {
        visitor: {
          ExportDefaultDeclaration(path) {
            const {start, end} = path.node
            nodes.push({type: 'export', start, end, default: true})
          },
          ExportNamedDeclaration(path) {
            const {start, end} = path.node
            nodes.push({type: 'export', start, end})
          },
          ImportDeclaration(path) {
            const {start, end} = path.node

            // Imports that are used in exports can end up as
            // ImportDeclarations with no start/end metadata,
            // these can be ignored
            if (start === undefined) {
              return
            }

            nodes.push({type: 'import', start, end})
          }
        }
      }
    })
  }
}

// Module.exports = BabelPluginExtractImportsAndExports

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
