const toStyleObject = require('to-style').object
const { paramCase } = require('change-case')

function toJSX(node, parentNode = {}, options = {}) {
  const {
    // default options
    skipExport = false,
    preserveNewlines = false,
  } = options
  let children = ''

  if (node.properties != null) {
    if (typeof node.properties.style === 'string') {
      node.properties.style = toStyleObject(node.properties.style, { camelize: true })
    }

    // ariaProperty => aria-property
    // dataProperty => data-property
    const paramCaseRe = /^(aria[A-Z])|(data[A-Z])/
    node.properties = Object.entries(node.properties).reduce((properties, [key, value]) => Object.assign(
      {},
      properties,
      { [paramCaseRe.test(key) ? paramCase(key) : key]: value },
    ), {})
  }

  if (node.type === 'root') {
    const importNodes = []
    const exportNodes = []
    const jsxNodes = []
    let layout
    for (const childNode of node.children) {
      if (childNode.type === 'import') {
        importNodes.push(childNode)
        continue
      }

      if (childNode.type === 'export') {
        if (childNode.default) {
          layout = childNode.value
            .replace(/^export\s+default\s+/, '')
            .replace(/;\s*$/, '')
          continue
        }

        if (
          /\bdefault\b/.test(childNode.value) &&
          !/default\s+as/.test(childNode.value)
        ) {
          let example

          if (/\}\s*from\s+/.test(childNode.value)) {
            example = `
              For example, instead of:

              export { default } from './Layout'

              use:

              import Layout from './Layout'
              export default Layout
            `.trim()
          } else {
            example = `
              For example, instead of:

              export { Layout as default }

              use:

              export default Layout
            `.trim()
          }

          throw new Error(`
            MDX doesn't support using "default" as a named export, use "export default" statement instead.

            ${example}
          `.trim().replace(/^ +/gm, ''))
        }

        exportNodes.push(childNode)
        continue
      }

      jsxNodes.push(childNode)
    }

    return (
      importNodes.map(childNode => toJSX(childNode, node)).join('\n') +
      '\n' +
      exportNodes.map(childNode => toJSX(childNode, node)).join('\n') +
      '\n' +
      (skipExport
        ? ''
        : 'export default ({components, ...props}) => ') +
      `<MDXTag name="wrapper" ${
        layout ? `Layout={${layout}} layoutProps={props}` : ''
      } components={components}>${jsxNodes
        .map(childNode => toJSX(childNode, node))
        .join('')}</MDXTag>`
    )
  }

  // recursively walk through children
  if (node.children) {
    children = node.children.map(childNode => {
      const childOptions = Object.assign({}, options, {
        // tell all children inside <pre> tags to preserve newlines as text nodes
        preserveNewlines: preserveNewlines || node.tagName === 'pre',
      })
      return toJSX(childNode, node, childOptions)
    }).join('')
  }

  if (node.type === 'element') {
    let props = ''

    if (Array.isArray(node.properties.className)) {
      node.properties.className = node.properties.className.join(' ')
    }

    if (Object.keys(node.properties).length > 0) {
      props = JSON.stringify(node.properties)
    }

    return `<MDXTag name="${node.tagName}" components={components}${
      parentNode.tagName ? ` parentName="${parentNode.tagName}"` : ''
    }${props ? ` props={${props}}` : ''}>${children}</MDXTag>`
  }

  // Wraps text nodes inside template string, so that we don't run into escaping issues.
  if (node.type === 'text') {
    // Don't wrap newlines unless specifically instructed to by the flag,
    // to avoid issues like React warnings caused by text nodes in tables.
    if (node.value === '\n' && !preserveNewlines) {
      return node.value
    }
    return '{`' + node.value.replace(/`/g, '\\`').replace(/\$/g, '\\$') + '`}'
  }

  if (node.type === 'comment') {
    return node.value
      .replace('<!--', '{/*')
      .replace('-->', '*/}')
  }

  if (node.type === 'import' || node.type === 'export' || node.type === 'jsx') {
    return node.value
  }
}

function compile(options = {}) {
  this.Compiler = tree => {
    return toJSX(tree, {}, options)
  }
}

module.exports = compile
exports = compile
exports.toJSX = toJSX
exports.default = compile
