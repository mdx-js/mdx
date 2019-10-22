const {transformSync} = require('@babel/core')

const syntaxJsxPlugin = require('@babel/plugin-syntax-jsx')
const proposalObjectRestSpreadPlugin = require('@babel/plugin-proposal-object-rest-spread')
const BabelPluginExtractImportsAndExports = require('babel-plugin-extract-imports-and-exports')

const partitionString = (str, indices) =>
  indices.map((val, i) => {
    return str.slice(val, indices[i + 1])
  })

module.exports = (value, vfile) => {
  const instance = new BabelPluginExtractImportsAndExports()

  transformSync(value, {
    plugins: [syntaxJsxPlugin, proposalObjectRestSpreadPlugin, instance.plugin],
    filename: vfile.path,
    configFile: false,
    babelrc: false
  })

  const sortedNodes = instance.state.nodes.sort((a, b) => a.start - b.start)
  const nodeStarts = sortedNodes.map(n => n.start)
  const values = partitionString(value, nodeStarts)

  const allNodes = sortedNodes.map(({start: _, ...node}, i) => {
    const value = values[i]
    return {...node, value}
  })

  // Group adjacent nodes of the same type so that they can be combined
  // into a single node later, this also ensures that order is preserved
  let currType = allNodes[0].type
  const groupedNodes = allNodes.reduce(
    (acc, curr) => {
      // Default export nodes shouldn't be grouped with other exports
      // because they're handled specially by MDX
      if (curr.default) {
        currType = 'default'
        return [...acc, [curr]]
      }

      if (curr.type === currType) {
        const lastNodes = acc.pop()
        return [...acc, [...lastNodes, curr]]
      }

      currType = curr.type
      return [...acc, [curr]]
    },
    [[]]
  )

  // Combine adjacent nodes into a single node
  return groupedNodes
    .filter(a => a.length)
    .reduce((acc, curr) => {
      const node = curr.reduce((acc, curr) => ({
        ...acc,
        value: acc.value + curr.value
      }))

      return [...acc, node]
    }, [])
}
