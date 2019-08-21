const {transformSync} = require('@babel/core')
const template = require('@babel/template').default
const generate = require('@babel/generator').default
const t = require('@babel/types')

const {paramCase, toTemplateLiteral, uniq} = require('@mdx-js/util')
const BabelPluginApplyMdxProp = require('babel-plugin-apply-mdx-type-prop')
const BabelPluginExtractImportNames = require('babel-plugin-extract-import-names')
// TODO: Create a babel plugin to add MDX shortcode instantiation

const buildElement = template(`
  <TAG_NAME
    parentName="PARENT_NAME"
  />
`, {
  plugins: ['jsx']
})
const buildElementWithChildren = template(`
  <TAG_NAME
    parentName="PARENT_NAME"
  >
    CHILDREN
  </TAG_NAME>
`, {
  plugins: ['jsx']
})
const buildShortcodes = template(`
  const {SHORTCODES} = useMDXComponents()
`)
const buildContentComponent = template(`
  const MDXLayout = LAYOUT

  function MDXContent(props) {
    return (
      <MDXLayout {...props}>
        CHILDREN
      </MDXLayout>
    )
  }

  MDXContent.isMDXComponent = true
`, {
  plugins: ['jsx']
})

function elementVisitor(node, parent) {
  if (!node.tagName) {
    console.log(node)
  }

  // TODO: Handle props
  const tagName = t.jsxIdentifier(node.tagName)
  const parentName = parent.tagName || parent.type

  if (node.children) {
    return generate(buildElementWithChildren({
      TAG_NAME: tagName,
      PARENT_NAME: parentName,
      CHILDREN: template(node.children.map(n => visit(n, node)).join(''))
    })).code
  } else {
    return generate(buildElement({
      TAG_NAME: tagName,
      PARENT_NAME: parentName
    })).code
  }
}

const rootVisitor = node => {
  // TODO: Pluck imports/exports to place at the top
  const children = node.children.map(n => visit(n, node)).join('\n\n')

  return generate(buildContentComponent({
    LAYOUT: t.stringLiteral('wrapper'),
    CHILDREN: template(children)
  })).code
}

const textVisitor = node => {
  return t.stringLiteral(node.value)
}

const commentVisitor = node => {
  return `{/* ${node.value} */}`
}

const visit = (node, parent) => {
  switch (node.type) {
    case 'root':
      return rootVisitor(node)
    case 'import':
    case 'export':
    case 'jsx':
      return node.value
    case 'text':
      return textVisitor(node)
    case 'comment':
      return commentVisitor(node)
    default:
      return elementVisitor(node, parent)
  }
}

function compile(options = {}) {
  this.Compiler = tree => visit(tree, options)
}

module.exports = compile
exports = compile
exports.default = compile
