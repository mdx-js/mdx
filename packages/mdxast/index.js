const visit = require('unist-util-visit')
const remove = require('unist-util-remove')

const IMPORT_REGEX = /^import/
const EXPORT_REGEX = /^export/

const isImport = text => IMPORT_REGEX.test(text)
const isExport = text => EXPORT_REGEX.test(text)

const restringify = node => {
  if (node.type === 'link') {
    return node.url
  } else if (node.type === 'linkReference') {
    return `[${node.children.map(n => n.value)}]`
  } else {
    return node.value
  }
}

const modules = tree => {
  return visit(tree, 'paragraph', (node, _i, parent) => {
    // `import` must be defined at the top level to be a real import
    if (parent.type !== 'root') {
      return node
    }

    // Get the text from the text node
    const { value } = node.children[0] || ''

    // Sets type to `export` in the AST if it's an export
    if (isExport(value)) {
      node.type = 'export'
      // Exports can have urls which remark-parse will turn into a child link node.
      node.value = node.children.map(restringify).join(' ')
      delete node.children
      return node
    }

    // Import paragraphs only have text in 1 node
    if (node.children.length !== 1) {
      return node
    }

    // Sets type to `import` in the AST if it's an import
    if (isImport(value)) {
      node.type = 'import'
      node.value = value
      delete node.children
      return node
    }

    return node
  })
}

// match component name by regexp
const componentName = value => {
  const match = value.match(/^\<\\?(\w+)/)
  return match && match[1]
}

// iterate in a reverse way to merge values then delete the unused node
const valuesFromNodes = tree => (first, last) => {
  const values = []

  if (first !== last) {
    for (let i = last; i >= first; i--) {
      const found = tree.children[i]

      if (found.children && found.children.length > 0) {
        values.push(...found.children.reverse().map(child => child.value))
      }

      if (found.value && found.value.length > 0) {
        values.push(found.value)
      }

      if (i !== first) remove(tree, found)
    }
  }

  return values
}

const removeLastBreak = value => {
  return value.endsWith('\n') ? value.substring(0, value.length - 1) : value
}

const mergeNodeWithoutCloseTag = (tree, node, idx) => {
  if (!node.value || typeof node.value !== 'string') return

  // parse component name and create two regexp to check open and close tag
  const component = componentName(node.value)
  const tagOpen = new RegExp(`^\\<${component}`)
  const tagClose = new RegExp(`\\<\\/${component}\\>$`)

  const hasOpenTag = val => tagOpen.test(val)
  const hasCloseTag = val => tagClose.test(val)
  const hasJustCloseTag = val => val && !hasOpenTag(val) && hasCloseTag(val)

  // return default value is has open and close tag
  if (!component || (hasOpenTag(node.value) && hasCloseTag(node.value))) {
    return
  }

  // when some node has just the open tag
  // find node index with equivalent close tag
  const tagCloseIdx = tree.children.findIndex(({ value, children }) => {
    if (children) return children.some(c => hasJustCloseTag(c.value))
    return hasJustCloseTag(value)
  })

  // merge all values from node open tag until node with the close tag
  const mergeUntilCloseTag = valuesFromNodes(tree)
  const values = mergeUntilCloseTag(idx, tagCloseIdx)

  node.value = values
    .reverse()
    .map(removeLastBreak)
    .join('\n')
}

// turns `html` nodes into `jsx` nodes
const jsx = tree => {
  visit(tree, 'html', visitor)

  function visitor(node, idx) {
    node.type = 'jsx'

    // check if a node has just open tag
    mergeNodeWithoutCloseTag(tree, node, idx)
  }
}

module.exports = options => tree => {
  modules(tree)
  jsx(tree)

  return tree
}
