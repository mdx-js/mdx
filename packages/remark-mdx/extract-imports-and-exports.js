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

  const allNodes = sortedNodes.map(({start: _, ...node}, i) => {
    const value = values[i]
    return {...node, value}
  })

  // Group adjacent nodes of the same type so that they can be combined
  // into a single node later
  let currType = allNodes[0].type
  const groupedNodes = allNodes.reduce(
    (acc, curr) => {
      // Default export nodes shouldn't be grouped with other exports
      // because they're handled specially by MDX
      if (curr.default) {
        currType = 'default'
        acc.push([curr])
      } else if (curr.type === currType) {
        acc[acc.length - 1].push(curr)
      } else {
        currType = curr.type
        acc.push([curr])
      }

      return acc
    },
    [[]]
  )

  // Combine adjacent nodes into a single node
  return groupedNodes
    .filter(a => a.length)
    .reduce((acc, curr) => {
      const node = curr.shift()
      curr.forEach(n => {
        node.value += n.value
      })

      return acc.concat([node])
    }, [])
}
