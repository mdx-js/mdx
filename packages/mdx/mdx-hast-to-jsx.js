const {transform} = require('@babel/standalone')
const template = require('@babel/template').default
const generate = require('@babel/generator').default
const t = require('@babel/types')
const {isEmptyObject, toTemplateLiteral} = require('@mdx-js/util')

const BabelPluginApplyMdxProp = require('babel-plugin-apply-mdx-type-prop')
const BabelPluginExtractImportNames = require('babel-plugin-extract-import-names')
const babelPluginHtmlAttributesToJsx = require('babel-plugin-html-attributes-to-jsx')
const babelPluginWrapDefaultExport = require('babel-plugin-wrap-default-export')
// TODO: Create a babel plugin to add MDX shortcode instantiation

const serializeChild = node =>
  typeof node === 'string' ? node : generate(node).code
const serializeChildren = children => children.map(serializeChild).join('')

const buildParentNameAttribute = parentName =>
  parentName !== 'root'
    ? t.jsxAttribute(t.jsxIdentifier('parentName'), t.stringLiteral(parentName))
    : null

// Transforming an array or object to an AST is rather
// cumbersome, so let's use a raw template for now.
const buildObjectPropValue = value => {
  const ast = template.ast(`<>{${JSON.stringify(value)}}</>`, {
    plugins: ['jsx', babelPluginHtmlAttributesToJsx]
  })

  return ast.expression.children[0]
}

const buildTemplateLiteral = value => {
  const ast = template.ast(`<>${toTemplateLiteral(value)}</>`, {
    plugins: ['jsx']
  })

  return ast.expression.children[0]
}

const shortcodeTemplate = template(`
  const IDENTIFIER = mdxMakeShortcode(STRING)
`)

const buildShortcode = name => {
  return shortcodeTemplate({
    IDENTIFIER: t.identifier(name),
    STRING: t.stringLiteral(name)
  })
}

const buildPropValue = value => {
  switch (typeof value) {
    case 'string':
      return t.stringLiteral(value)
    case 'object':
      return buildObjectPropValue(value)
    case 'boolean':
      return t.jsxExpressionContainer(t.booleanLiteral(value))
    default:
      return t.jsxExpressionContainer(t.nullLiteral())
  }
}

const buildProps = props => {
  if (isEmptyObject(props)) {
    return []
  }

  return Object.entries(props).map(([key, value]) => {
    return t.jsxAttribute(t.jsxIdentifier(key), buildPropValue(value))
  })
}

const buildElement = ({tagName, props, parentName, children = []}) => {
  const selfClosing = Boolean(children.length)

  return t.jsxElement(
    t.jsxOpeningElement(
      tagName,
      [buildParentNameAttribute(parentName), ...buildProps(props)].filter(
        Boolean
      )
    ),
    t.jsxClosingElement(tagName),
    children,
    selfClosing
  )
}

const buildLayout = layout => generate(layout).code

const buildJsx = ({children, layout, importNodes, exportNodes}, options) => {
  const extractImportNames = new BabelPluginExtractImportNames()
  const applyMdxProp = new BabelPluginApplyMdxProp()

  const layoutJsx = buildLayout(layout)
  const childJsx = serializeChildren(children)
  const importJs = importNodes.map(n => n.value).join('\n')
  const exportJs = exportNodes.map(n => n.value).join('\n')

  // TODO: Shortcodes plugin should run on import + exports
  //       and then append for interpolation below.

  const jsx = transform(
    `
    ${importJs}
    ${exportJs}

    const MDXLayout = ${layoutJsx};

    const MDXContent = props => {
      return (
        <MDXLayout {...props}>
          ${childJsx}
        </MDXLayout>
      )
    };

    MDXContent.isMDXComponent = true

    export default MDXContent
  `,
    {
      plugins: [
        require('@babel/plugin-syntax-jsx'),
        require('@babel/plugin-syntax-object-rest-spread'),
        extractImportNames.plugin,
        applyMdxProp.plugin,
        // TODO: Shortcodes plugin
        babelPluginHtmlAttributesToJsx,
        [babelPluginWrapDefaultExport, {wrapper: options.wrapExport}]
      ].filter(Boolean)
    }
  )

  const shortcodes = applyMdxProp.state.names
    .filter(s => s !== 'MDXLayout')
    .filter(s => !extractImportNames.state.names.includes(s))

  const shortcodeFunctionCode = template.ast(
    `
    const mdxMakeShortcode = name => props => {
      console.warn("Component " + name + " was not imported, exported, or provided by MDXProvider as global scope")
      return <div {...props}/>
    }
  `,
    {
      plugins: ['jsx']
    }
  )

  const shortcodesCode = shortcodes
    .map(shortcode => buildShortcode(shortcode))
    .map(code => generate(code).code)

  return [
    jsx.code,
    generate(shortcodeFunctionCode).code,
    ...shortcodesCode
  ].join('\n')

  return transform(jsx.code, {
    plugins: [
      require('@babel/plugin-syntax-jsx'),
      require('@babel/plugin-syntax-object-rest-spread'),
      shortcodes.length && injectShortcodes(shortcodes)
    ].filter(Boolean)
  }).code
}

const elementVisitor = (node, parent) => {
  const tagName = t.jsxIdentifier(node.tagName)
  const parentName = parent.tagName || parent.type

  const element = buildElement({
    tagName,
    parentName,
    props: node.properties,
    children: node.children.map(n => visit(n, node))
  })

  return element
}

const rootVisitor = (node, options) => {
  let layout = t.stringLiteral('wrapper')
  const childNodes = []
  const importNodes = []
  const exportNodes = []

  node.children.forEach(n => {
    if (n.type === 'import') {
      importNodes.push(n)
    } else if (n.type === 'export' && n.default) {
      layout = template.ast(n.value, {plugins: ['jsx']}).declaration
    } else if (n.type === 'export') {
      exportNodes.push(n)
    } else if (n.type) {
      childNodes.push(n)
    }
  })

  const children = childNodes.map(n => visit(n, node))

  return buildJsx(
    {
      layout,
      children,
      importNodes,
      exportNodes
    },
    options
  )
}

// After all children are processed we reparse the
// JSX so for now we can pass along the raw string
// value.
const jsSyntaxVisitor = node => node.value

// TODO: I'm sure this isn't working like we expect.
const textVisitor = (node, parent) => {
  if (parent.type === 'root') {
    return t.jsxText(node.value)
  }

  if (
    node.value.includes('$') ||
    node.value.includes('<') ||
    node.value.includes('{') ||
    node.value.includes('}') ||
    node.value.includes('`')
  ) {
    return buildTemplateLiteral(node.value)
  }

  return t.jsxText(node.value)
}

// We don't really need to persist comments to the
// compiled JSX.
const commentVisitor = () => ''

const visit = (node, parent, options) => {
  switch (node.type) {
    case 'root':
      return rootVisitor(node, options)
    case 'import':
    case 'export':
    case 'jsx':
      return jsSyntaxVisitor(node)
    case 'text':
      return textVisitor(node, parent)
    case 'comment':
      return commentVisitor(node)
    default:
      return elementVisitor(node, parent)
  }
}

function compile(options = {}) {
  this.Compiler = tree => {
    return visit(tree, null, options)
  }
}

module.exports = compile
exports = compile
exports.default = compile
