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

            // Imports that are used in exports can end up as
            // ImportDeclarations with no start/end metadata,
            // these can be ignored
            if (start === undefined) {
              return
            }

            nodes.push({type: 'import', start})
          }
        }
      }
    })
  }
}

module.exports = BabelPluginExtractImportsAndExports
