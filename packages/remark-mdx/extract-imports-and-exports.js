const {transformSync} = require('@babel/core')
const declare = require('@babel/helper-plugin-utils').declare

class BabelPluginExtractImportsAndExports {
  constructor() {
    const nodes = []
    this.state = {nodes}

    this.plugin = declare(api => {
      api.assertVersion(7)

      return {
        visitor: {
          ExportDefaultDeclaration(path) {
            const {start} = path.node
            nodes.push({type: 'export', start, default: true})
          },
          ExportNamedDeclaration(path) {
            const {start} = path.node
            nodes.push({type: 'export', start})
          },
          ImportDeclaration(path) {
            const {start} = path.node
            nodes.push({type: 'import', start})
          }
        }
      }
    })
  }
}

const partitionString = (str, indices) =>
  indices.map((val, i) => {
    return str.slice(val, indices[i + 1])
  })

module.exports = value => {
  const instance = new BabelPluginExtractImportsAndExports()

  transformSync(value, {
    plugins: [
      '@babel/plugin-syntax-jsx',
      '@babel/plugin-proposal-object-rest-spread',
      instance.plugin
    ]
  })

  const sortedNodes = instance.state.nodes.sort((a, b) => a.start - b.start)
  const nodeStarts = sortedNodes.map(n => n.start)
  const values = partitionString(value, nodeStarts)

  return sortedNodes.map(({start: _, ...node}, i) => {
    const value = values[i]
    return {...node, value}
  })
}
