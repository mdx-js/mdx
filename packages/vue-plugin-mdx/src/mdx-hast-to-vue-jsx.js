function toVueJSX(node, parentNode = {}, options = {}) {
  let children = ''

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

        exportNodes.push(childNode)
        continue
      }

      jsxNodes.push(childNode)
    }

    return (
      importNodes.map(childNode => toVueJSX(childNode, node)).join('\n') +
      '\n' +
      exportNodes.map(childNode => toVueJSX(childNode, node)).join('\n') +
      '\n' +
      (options.skipExport ? '' : toVueExport(layout, jsxNodes, node))
    )
  }

  // Recursively walk through children
  if (node.children) {
    children = node.children
      .map(childNode => toVueJSX(childNode, node))
      .join('')
  }

  if (node.type === 'comment') {
    return node.value.replace('<!--', '{/*').replace('-->', '*/}')
  }

  if (node.type === 'element') {
    let props = ''

    if (Array.isArray(node.properties.className)) {
      node.properties.className = node.properties.className.join(' ')
    }

    if (Object.keys(node.properties).length > 0) {
      props = JSON.stringify(node.properties)
    }

    return `<MDXTag name="${node.tagName}" components={this.components}${
      parentNode.tagName ? ` parentName="${parentNode.tagName}"` : ''
    }${props ? ` props={${props}}` : ''}>${children}</MDXTag>`
  }

  // Wraps all text nodes except new lines inside template string, so that we don't run into escaping issues.
  if (node.type === 'text') {
    return node.value === '\n'
      ? node.value
      : '{`' + node.value.replace(/`/g, '\\`').replace(/\$/g, '\\$') + '`}'
  }

  if (node.type === 'import' || node.type === 'export' || node.type === 'jsx') {
    return node.value
  }
}

function toVueExport(layout, jsxNodes, node) {
  return `
    export default {
      props: {
        components: {
          type: Object,
          default: {}
        }
      },
      render() {
        return (
          <MDXTag ${layout ? `Layout={${layout}} layoutProps={props}` : ''}
            name="wrapper"
            components={this.components}
          >
            ${jsxNodes.map(childNode => toVueJSX(childNode, node)).join('')}
          </MDXTag>
        );
      }
    }
  `
}

export function VueJSXCompiler(options = {}) {
  this.Compiler = tree => {
    return toVueJSX(tree, {}, options)
  }
}
