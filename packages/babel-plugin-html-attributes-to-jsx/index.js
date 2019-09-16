const styleToObject = require('style-to-object')
const camelCaseCSS = require('camelcase-css')
const t = require('@babel/types')
// TODO: paramCase and camelCase are sort of confused here.
const {paramCase: camelCase} = require('@mdx-js/util')

const TRANSLATIONS = require('./translations')
const ARRAY_TO_STRING = {
  className: true,
  sandbox: true
}

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
      node.node.name.name.startsWith(`data`) ||
      node.node.name.name.startsWith(`aria`)
    ) {
      const CAMEL_CASE_REGEX = /^(aria[A-Z])|(data[A-Z])/
      if (CAMEL_CASE_REGEX.test(node.node.name.name)) {
        node.node.name.name = camelCase(node.node.name.name)
      }
    } else if (
      node.node.name.name in ARRAY_TO_STRING &&
      node.node.value.type === 'JSXExpressionContainer' &&
      node.node.value.expression.type === 'ArrayExpression'
    ) {
      node.node.value = t.stringLiteral(
        node.node.value.expression.elements.map(el => el.value).join(' ')
      )
    }

    if (
      node.node.name.name === `style` &&
      node.node.value.type === `StringLiteral`
    ) {
      let styleArray = []
      styleToObject(node.node.value.extra.rawValue, function(name, value) {
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
