const {types: t} = require('@babel/core')
const {declare} = require('@babel/helper-plugin-utils')
const {startsWithCapitalLetter} = require('@mdx-js/util')

const applyMdxType = (node, jsxName) => {
  node.attributes.push(
    t.jSXAttribute(t.jSXIdentifier(`mdxType`), t.stringLiteral(jsxName))
  )
}

class BabelPluginApplyMdxTypeProp {
  constructor() {
    const names = []
    this.state = {names}

    this.plugin = declare(api => {
      api.assertVersion(7)
      const {types: t} = api

      return {
        visitor: {
          JSXOpeningElement(path) {
            if (t.isJSXMemberExpression(path.node.name)) {
              const objName = path.node.name.object.name
              const propName = path.node.name.property.name
              const fullJsxName = `${objName}.${propName}`

              names.push(objName)
              names.push(fullJsxName)

              applyMdxType(path.node, fullJsxName)
            }

            const jsxName = path.node.name.name

            if (startsWithCapitalLetter(jsxName)) {
              names.push(jsxName)

              applyMdxType(path.node, jsxName)
            }
          }
        }
      }
    })
  }
}

module.exports = BabelPluginApplyMdxTypeProp
