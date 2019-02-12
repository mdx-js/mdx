const {transformSync} = require('@babel/core')
const generate = require('@babel/generator').default
const declare = require('@babel/helper-plugin-utils').declare

const stripTrailingSemi = str => str.replace(/;$/, '')

class BabelPluginExtractImportsAndExports {
  constructor(code) {
    const nodes = []
    this.state = {nodes}

    this.plugin = declare(api => {
      api.assertVersion(7)

      return {
        visitor: {
          ExportDefaultDeclaration(path) {
            const declaration = path.node.declaration
            const value = generate(declaration, {}, code).code

            nodes.push({type: 'export', value, default: true})
          },
          ExportNamedDeclaration(path) {
            const value = generate(path.node, {}, code).code

            nodes.push({type: 'export', value: stripTrailingSemi(value)})
          },
          ImportDeclaration(path) {
            const value = generate(path.node, {}, code).code

            nodes.push({type: 'import', value: stripTrailingSemi(value)})
          }
        }
      }
    })
  }
}

module.exports = value => {
  const instance = new BabelPluginExtractImportsAndExports(value)

  transformSync(value, {
    plugins: [
      '@babel/plugin-syntax-jsx',
      '@babel/plugin-proposal-object-rest-spread',
      instance.plugin
    ]
  })

  return instance.state.nodes
}
