const astring = require('astring')

module.exports = estreeToJs

const customGenerator = Object.assign({}, astring.baseGenerator, {
  JSXAttribute: JSXAttribute,
  JSXClosingElement: JSXClosingElement,
  JSXClosingFragment: JSXClosingFragment,
  JSXElement: JSXElement,
  JSXEmptyExpression: JSXEmptyExpression,
  JSXExpressionContainer: JSXExpressionContainer,
  JSXFragment: JSXFragment,
  JSXIdentifier: JSXIdentifier,
  JSXMemberExpression: JSXMemberExpression,
  JSXNamespacedName: JSXNamespacedName,
  JSXOpeningElement: JSXOpeningElement,
  JSXOpeningFragment: JSXOpeningFragment,
  JSXSpreadAttribute: JSXSpreadAttribute,
  JSXText: JSXText
})

function estreeToJs(estree) {
  return astring.generate(estree, {generator: customGenerator})
}

// `attr="something"`
function JSXAttribute(node, state) {
  state.write(' ')
  this[node.name.type](node.name, state)

  if (node.value != null) {
    state.write('=')
    this[node.value.type](node.value, state)
  }
}

// `</div>`
function JSXClosingElement(node, state) {
  this[node.name.type](node.name, state)
}

// `</>`
function JSXClosingFragment(node, state) {
  state.write('</>')
}

// `<div></div>`
function JSXElement(node, state) {
  state.write('<')
  this[node.openingElement.type](node.openingElement, state)
  if (node.closingElement) {
    state.write('>')
    let index = -1

    while (++index < node.children.length) {
      this[node.children[index].type](node.children[index], state)
    }

    state.write('</')
    this[node.closingElement.type](node.closingElement, state)
    state.write('>')
  } else {
    state.write(' />')
  }
}

// `<></>`
function JSXFragment(node, state) {
  this[node.openingFragment.type](node.openingElement, state)

  let index = -1

  while (++index < node.children.length) {
    this[node.children[index].type](node.children[index], state)
  }

  /* istanbul ignore if - incorrect tree. */
  if (!node.closingFragment) {
    throw new Error('Cannot handle fragment w/o closing tag')
  }

  this[node.closingFragment.type](node.closingElement, state)
}

// `{}`
function JSXEmptyExpression() {}

// `{expression}`
function JSXExpressionContainer(node, state) {
  state.write('{')
  this[node.expression.type](node.expression, state)
  state.write('}')
}

// `<div>`
function JSXOpeningElement(node, state) {
  let index = -1

  this[node.name.type](node.name, state)

  while (++index < node.attributes.length) {
    this[node.attributes[index].type](node.attributes[index], state)
  }
}

// `<>`
function JSXOpeningFragment(node, state) {
  state.write('<>')
}

// `div`
function JSXIdentifier(node, state) {
  state.write(node.name)
}

// `member.expression`
function JSXMemberExpression(node, state) {
  this[node.object.type](node.object, state)
  state.write('.')
  this[node.property.type](node.property, state)
}

// `ns:attr="something"`
/* istanbul ignore next - MDX (and most JSX things) don’t support them.
 * But keep it here just in case we might in the future. */
function JSXNamespacedName(node, state) {
  this[node.namespace.type](node.namespace, state)
  state.write(':')
  this[node.name.type](node.name, state)
}

// `{...argument}`
function JSXSpreadAttribute(node, state) {
  state.write(' {')
  /* eslint-disable-next-line new-cap */
  this.SpreadElement(node, state)
  state.write('}')
}

// `!`
function JSXText(node, state) {
  /* istanbul ignore next - `raw` is currently always be set, but could be
   * missing if something injects a `JSXText` into the tree.
   * Preferring `raw` over `value` means character references are kept as-is. */
  const value = node.raw || node.value
  state.write(value)
}
