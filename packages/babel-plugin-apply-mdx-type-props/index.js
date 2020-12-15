const {types: t} = require('@babel/core')
const {declare} = require('@babel/helper-plugin-utils')

const startsWithCapitalLetter = str => /^[A-Z]/.test(str)

class BabelPluginApplyMdxTypeProp {
  constructor() {
    const names = []
    this.state = {names}

    this.plugin = declare(api => {
      api.assertVersion(7)

      return {
        visitor: {
          JSXOpeningElement(path) {
            const jsxName = path.node.name.name

            let parentPath = path.parentPath.parentPath
            let parentName

            while (parentPath) {
              if (parentPath.node.type === 'JSXElement') {
                parentName = parentPath.node.openingElement.name.name
                break
              }

              parentPath = parentPath.parentPath
            }

            if (typeof parentName === 'string' && parentName !== 'MDXLayout') {
              path.node.attributes.push(
                t.jSXAttribute(
                  t.jSXIdentifier(`parentName`),
                  t.stringLiteral(parentName)
                )
              )
            }

            if (startsWithCapitalLetter(jsxName)) {
              names.push(jsxName)

              path.node.attributes.push(
                t.jSXAttribute(
                  t.jSXIdentifier(`mdxType`),
                  t.stringLiteral(jsxName)
                )
              )
            }
          }
        }
      }
    })
  }
}

module.exports = BabelPluginApplyMdxTypeProp
