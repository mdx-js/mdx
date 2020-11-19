const styleToObject = require('style-to-object')
const camelCaseCSS = require('camelcase-css')
const t = require('@babel/types')

const camelCase = string =>
  string
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([a-z])([0-9])/g, '$1-$2')
    .toLowerCase()

const TRANSLATIONS = require('./translations')

const propsKeysVisitor = {
  ObjectProperty(node) {
    if (node.node.key.extra.rawValue in TRANSLATIONS) {
      node.node.key.value =
        TRANSLATIONS[node.node.key.value] || node.node.key.value
    }
  }
}

const jsxAttributeFromHTMLAttributeVisitor = {
  JSXAttribute(node) {
    if (node.node.name.name in TRANSLATIONS) {
      node.node.name.name = TRANSLATIONS[node.node.name.name]
    } else if (node.node.name.name === `props`) {
      node.traverse(propsKeysVisitor)
    } else if (
      node.node.name.name.includes(`-`) &&
      !node.node.name.name.startsWith(`data`) &&
      !node.node.name.name.startsWith(`aria`)
    ) {
      node.node.name.name = camelCase(node.node.name.name)
    }

    if (
      node.node.name.name === `style` &&
      node.node.value.type === `StringLiteral`
      //      Node.node.value.type !== "JSXExpressionContainer"
    ) {
      let styleArray = []
      styleToObject(node.node.value.extra.rawValue, function (name, value) {
        styleArray.push([camelCaseCSS(name), value])
      })
      node.node.value = t.jSXExpressionContainer(
        t.objectExpression(
          styleArray.map(([key, value]) =>
            t.objectProperty(t.stringLiteral(key), t.stringLiteral(value))
          )
        )
      )
    }
  }
}

const babelPluginHtmlAttributesToJsx = () => {
  return {
    visitor: {
      JSXElement(path) {
        path.traverse(jsxAttributeFromHTMLAttributeVisitor)
      }
    }
  }
}

module.exports = babelPluginHtmlAttributesToJsx
