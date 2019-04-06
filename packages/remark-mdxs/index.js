const visit = require('unist-util-visit')
const remove = require('unist-util-remove')
const {toJSX} = require('@mdx-js/mdx/mdx-hast-to-jsx')

module.exports = function({delimiter = 'hr'}) {
  this.Compiler = tree => {
    const splits = []
    const documents = []

    const importNodes = tree.children.filter(n => n.type === 'import')
    const exportNodes = tree.children.filter(n => n.type === 'export')

    const layout = exportNodes.find(node => node.default)

    // We don't care about imports and exports when handling
    // multiple MDX documents
    let mdxsTree = remove(remove(tree, 'export'), 'import')
    const {children} = mdxsTree

    visit(mdxsTree, node => {
      if (node.tagName === delimiter) {
        splits.push(children.indexOf(node))
      }
    })

    let previousSplit = 0
    for (let i = 0; i < splits.length; i++) {
      const split = splits[i]
      documents.push(children.slice(previousSplit, split))
      previousSplit = split + 1
    }

    documents.push(children.slice(previousSplit))

    const jsxFragments = documents
      .map(nodes => nodes.map(toJSX).join('\n'))
      .map((jsx, i) =>
        `
function MDXSContent${i}({ components, ...props }) {
  return (
    ${jsx.trim()}
  )
}
    `.trim()
      )

    const defaultExport = `
const MDXSWrapper = props => [
${jsxFragments.map((_, i) => `  <MDXSContent${i} {...props} />`).join(',\n')}
]

export default MDXWrapper
    `.trim()

    return [
      importNodes.map(n => n.value.trim()).join('\n'),
      '',
      exportNodes
        .filter(n => !n.default)
        .map(n => n.value.trim())
        .join('\n'),
      '',
      `const MDXSLayout = ${
        layout
          ? layout.value
              .replace(/^export\s+default\s+/, '')
              .replace(/;\s*$/, '')
          : '"wrapper"'
      }`,
      '',
      jsxFragments.join('\n\n'),
      '',
      defaultExport
    ].join('\n')
  }
}
