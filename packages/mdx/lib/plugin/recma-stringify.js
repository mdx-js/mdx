/**
 * @typedef {import('estree-jsx').Node} Node
 * @typedef {import('estree-jsx').Program} Program
 * @typedef {import('estree-jsx').JSXAttribute} JSXAttribute
 * @typedef {import('estree-jsx').JSXClosingElement} JSXClosingElement
 * @typedef {import('estree-jsx').JSXClosingFragment} JSXClosingFragment
 * @typedef {import('estree-jsx').JSXElement} JSXElement
 * @typedef {import('estree-jsx').JSXEmptyExpression} JSXEmptyExpression
 * @typedef {import('estree-jsx').JSXExpressionContainer} JSXExpressionContainer
 * @typedef {import('estree-jsx').JSXFragment} JSXFragment
 * @typedef {import('estree-jsx').JSXIdentifier} JSXIdentifier
 * @typedef {import('estree-jsx').JSXMemberExpression} JSXMemberExpression
 * @typedef {import('estree-jsx').JSXNamespacedName} JSXNamespacedName
 * @typedef {import('estree-jsx').JSXOpeningElement} JSXOpeningElement
 * @typedef {import('estree-jsx').JSXOpeningFragment} JSXOpeningFragment
 * @typedef {import('estree-jsx').JSXSpreadAttribute} JSXSpreadAttribute
 * @typedef {import('estree-jsx').JSXText} JSXText
 * @typedef {import('vfile').VFile} VFile
 * @typedef {typeof import('source-map').SourceMapGenerator} SourceMapGenerator
 *
 * @typedef {Omit<import('astring').State, 'write'> & {write: ((code: string, node?: Node) => void)}} State
 *
 * @typedef {{[K in Node['type']]: (node: Node, state: State) => void}} Generator
 *
 * @typedef RecmaStringifyOptions
 * @property {SourceMapGenerator} [SourceMapGenerator]
 *   Generate a source map by passing a `SourceMapGenerator` from `source-map`
 *   in.
 */

import {GENERATOR, generate} from 'astring'

/**
 * A plugin that adds an esast compiler: a small wrapper around `astring` to add
 * support for serializing JSX.
 *
 * @type {import('unified').Plugin<[RecmaStringifyOptions]|[], Program, string>}
 */
export function recmaStringify(options = {}) {
  const {SourceMapGenerator} = options

  Object.assign(this, {Compiler: compiler})

  /** @type {import('unified').CompilerFunction<Program, string>} */
  function compiler(tree, file) {
    /** @type {InstanceType<SourceMapGenerator>|undefined} */
    let sourceMap

    if (SourceMapGenerator) {
      sourceMap = new SourceMapGenerator({file: file.path || 'unknown.mdx'})
    }

    const generator = {
      ...GENERATOR,
      JSXAttribute,
      JSXClosingElement,
      JSXClosingFragment,
      JSXElement,
      JSXEmptyExpression,
      JSXExpressionContainer,
      JSXFragment,
      JSXIdentifier,
      JSXMemberExpression,
      JSXNamespacedName,
      JSXOpeningElement,
      JSXOpeningFragment,
      JSXSpreadAttribute,
      JSXText
    }

    const result = generate(tree, {
      generator,
      comments: true,
      sourceMap
    })

    if (sourceMap) {
      file.map = sourceMap.toJSON()
    }

    return result
  }
}

/**
 * `attr`
 * `attr="something"`
 * `attr={1}`
 *
 * @this {Generator}
 * @param {JSXAttribute} node
 * @param {State} state
 * @returns {void}
 */
function JSXAttribute(node, state) {
  this[node.name.type](node.name, state)

  if (node.value !== undefined && node.value !== null) {
    state.write('=')

    // Encode double quotes in attribute values.
    if (node.value.type === 'Literal') {
      state.write(
        '"' + encodeJsx(String(node.value.value)).replace(/"/g, '&quot;') + '"',
        node
      )
    } else {
      this[node.value.type](node.value, state)
    }
  }
}

/**
 * `</div>`
 *
 * @this {Generator}
 * @param {JSXClosingElement} node
 * @param {State} state
 * @returns {void}
 */
function JSXClosingElement(node, state) {
  state.write('</')
  this[node.name.type](node.name, state)
  state.write('>')
}

/**
 * `</>`
 *
 * @this {Generator}
 * @param {JSXClosingFragment} node
 * @param {State} state
 * @returns {void}
 */
function JSXClosingFragment(node, state) {
  state.write('</>', node)
}

/**
 * `<div />`
 * `<div></div>`
 *
 * @this {Generator}
 * @param {JSXElement} node
 * @param {State} state
 * @returns {void}
 */
function JSXElement(node, state) {
  let index = -1

  this[node.openingElement.type](node.openingElement, state)

  if (node.children) {
    while (++index < node.children.length) {
      const child = node.children[index]

      // Supported in types but not by Acorn.
      /* c8 ignore next 3 */
      if (child.type === 'JSXSpreadChild') {
        throw new Error('JSX spread children are not supported')
      }

      this[child.type](child, state)
    }
  }

  if (node.closingElement) {
    this[node.closingElement.type](node.closingElement, state)
  }
}

/**
 * `{}` (always in a `JSXExpressionContainer`, which does the curlies)
 *
 * @this {Generator}
 * @returns {void}
 */
function JSXEmptyExpression() {}

/**
 * `{expression}`
 *
 * @this {Generator}
 * @param {JSXExpressionContainer} node
 * @param {State} state
 * @returns {void}
 */
function JSXExpressionContainer(node, state) {
  state.write('{')
  this[node.expression.type](node.expression, state)
  state.write('}')
}

/**
 * `<></>`
 *
 * @this {Generator}
 * @param {JSXFragment} node
 * @param {State} state
 * @returns {void}
 */
function JSXFragment(node, state) {
  let index = -1

  this[node.openingFragment.type](node.openingFragment, state)

  if (node.children) {
    while (++index < node.children.length) {
      const child = node.children[index]

      // Supported in types but not by Acorn.
      /* c8 ignore next 3 */
      if (child.type === 'JSXSpreadChild') {
        throw new Error('JSX spread children are not supported')
      }

      this[child.type](child, state)
    }
  }

  this[node.closingFragment.type](node.closingFragment, state)
}

/**
 * `div`
 *
 * @this {Generator}
 * @param {JSXIdentifier} node
 * @param {State} state
 * @returns {void}
 */
function JSXIdentifier(node, state) {
  state.write(node.name, node)
}

/**
 * `member.expression`
 *
 * @this {Generator}
 * @param {JSXMemberExpression} node
 * @param {State} state
 * @returns {void}
 */
function JSXMemberExpression(node, state) {
  this[node.object.type](node.object, state)
  state.write('.')
  this[node.property.type](node.property, state)
}

/**
 * `ns:name`
 *
 * @this {Generator}
 * @param {JSXNamespacedName} node
 * @param {State} state
 * @returns {void}
 */
function JSXNamespacedName(node, state) {
  this[node.namespace.type](node.namespace, state)
  state.write(':')
  this[node.name.type](node.name, state)
}

/**
 * `<div>`
 *
 * @this {Generator}
 * @param {JSXOpeningElement} node
 * @param {State} state
 * @returns {void}
 */
function JSXOpeningElement(node, state) {
  let index = -1

  state.write('<')
  this[node.name.type](node.name, state)

  if (node.attributes) {
    while (++index < node.attributes.length) {
      state.write(' ')
      this[node.attributes[index].type](node.attributes[index], state)
    }
  }

  state.write(node.selfClosing ? ' />' : '>')
}

/**
 * `<>`
 *
 * @this {Generator}
 * @param {JSXOpeningFragment} node
 * @param {State} state
 * @returns {void}
 */
function JSXOpeningFragment(node, state) {
  state.write('<>', node)
}

/**
 * `{...argument}`
 *
 * @this {Generator}
 * @param {JSXSpreadAttribute} node
 * @param {State} state
 * @returns {void}
 */
function JSXSpreadAttribute(node, state) {
  state.write('{')
  // eslint-disable-next-line new-cap
  this.SpreadElement(node, state)
  state.write('}')
}

/**
 * `!`
 *
 * @this {Generator}
 * @param {JSXText} node
 * @param {State} state
 * @returns {void}
 */
function JSXText(node, state) {
  state.write(
    encodeJsx(node.value).replace(/<|{/g, ($0) =>
      $0 === '<' ? '&lt;' : '&#123;'
    ),
    node
  )
}

/**
 * Make sure that character references don’t pop up.
 * For example, the text `&copy;` should stay that way, and not turn into `©`.
 * We could encode all `&` (easy but verbose) or look for actual valid
 * references (complex but cleanest output).
 * Looking for the 2nd character gives us a middle ground.
 * The `#` is for (decimal and hexadecimal) numeric references, the letters
 * are for the named references.
 *
 * @param {string} value
 * @returns {string}
 */
function encodeJsx(value) {
  return value.replace(/&(?=[#a-z])/gi, '&amp;')
}
