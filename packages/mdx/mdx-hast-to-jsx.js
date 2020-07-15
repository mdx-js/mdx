const {transformSync} = require('@babel/core')
const uniq = require('lodash.uniq')
const encode = require('stringify-entities/light')
const toH = require('hast-to-hyperscript')
const recast = require('recast')
const BabelPluginApplyMdxProp = require('babel-plugin-apply-mdx-type-prop')
const BabelPluginExtractImportNames = require('babel-plugin-extract-import-names')
const BabelPluginExtractExportNames = require('babel-plugin-extract-export-names')

// To do: `recast` might be heavy (have to check), and `astring` might be a good
// alternative.
// However, `astring` doesn’t support JSX.
// When we start compiling JSX away, `astring` might be a good fit though.

function toJSX(node, parentNode = {}, options = {}) {
  if (node.type === 'root') {
    return serializeRoot(node, options)
  }

  if (node.type === 'element') {
    return serializeElement(node, options, parentNode)
  }

  // Wraps text nodes inside template string, so that we don't run into escaping issues.
  if (node.type === 'text') {
    return serializeText(node, options, parentNode)
  }

  if (node.type === 'mdxFlowExpression' || node.type === 'mdxTextExpression') {
    return serializeMdxExpression(node)
  }

  // To do: pass `parentName` in?
  if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
    return serializeComponent(node, options, parentNode)
  }
}

function serializeRoot(node, options) {
  const {
    // Default options
    skipExport = false,
    wrapExport
  } = options

  const groups = {mdxjsEsm: [], rest: []}

  node.children.forEach(child => {
    groups[child.type === 'mdxjsEsm' ? child.type : 'rest'].push(child)
  })

  // Find a default export, assumes there’s zero or one.
  const importStatements = []
  const exportStatements = []
  let layout

  groups.mdxjsEsm.forEach(child => {
    child.data.estree.body.forEach(eschild => {
      if (eschild.type === 'ImportDeclaration') {
        importStatements.push(recast.prettyPrint(eschild).code)
      } else if (eschild.type === 'ExportDefaultDeclaration') {
        layout = recast.prettyPrint(eschild.declaration).code
      } else {
        exportStatements.push(recast.prettyPrint(eschild).code)
      }
    })
  })

  const doc = groups.rest
    .map(childNode => toJSX(childNode, node, options))
    .join('')
    .replace(/^\n+|\n+$/, '')

  const fn = `function MDXContent({ components, ...props }) {
return (
  <MDXLayout {...props} components={components}>
${doc}
  </MDXLayout>
)
};
MDXContent.isMDXComponent = true`

  // Check JSX nodes against imports
  const babelPluginExtractImportNamesInstance = new BabelPluginExtractImportNames()
  const babelPluginExtractExportNamesInstance = new BabelPluginExtractExportNames()
  const importsAndExports = []
    .concat(importStatements, exportStatements)
    .join('\n')

  transformSync(importsAndExports, {
    configFile: false,
    babelrc: false,
    plugins: [
      require('@babel/plugin-syntax-jsx'),
      require('@babel/plugin-syntax-object-rest-spread'),
      babelPluginExtractImportNamesInstance.plugin,
      babelPluginExtractExportNamesInstance.plugin
    ]
  })

  const importNames = babelPluginExtractImportNamesInstance.state.names
  const exportNames = babelPluginExtractExportNamesInstance.state.names

  // Add `mdxType` props.
  const babelPluginApplyMdxPropInstance = new BabelPluginApplyMdxProp()
  const babelPluginApplyMdxPropToExportsInstance = new BabelPluginApplyMdxProp()

  const fnPostMdxTypeProp = transformSync(fn, {
    configFile: false,
    babelrc: false,
    plugins: [
      require('@babel/plugin-syntax-jsx'),
      require('@babel/plugin-syntax-object-rest-spread'),
      babelPluginApplyMdxPropInstance.plugin
    ]
  }).code

  const exportStatementsPostMdxTypeProps = transformSync(
    exportStatements.join('\n'),
    {
      configFile: false,
      babelrc: false,
      plugins: [
        require('@babel/plugin-syntax-jsx'),
        require('@babel/plugin-syntax-object-rest-spread'),
        babelPluginApplyMdxPropToExportsInstance.plugin
      ]
    }
  ).code

  const allJsxNames = [
    ...babelPluginApplyMdxPropInstance.state.names,
    ...babelPluginApplyMdxPropToExportsInstance.state.names
  ]
  const jsxNames = allJsxNames.filter(name => name !== 'MDXLayout')

  const importExportNames = importNames.concat(exportNames)
  const fakedModulesForGlobalScope =
    `const makeShortcode = name => function MDXDefaultShortcode(props) {
  console.warn("Component \`" + name + "\` was not imported, exported, or provided by MDXProvider as global scope")
  return <div {...props}/>
};
` +
    uniq(jsxNames)
      .filter(name => !importExportNames.includes(name))
      .map(name => `const ${name} = makeShortcode("${name}");`)
      .join('\n')

  const moduleBase = `${importStatements}
${exportStatementsPostMdxTypeProps}
${fakedModulesForGlobalScope}
const MDXLayout = ${layout || '"wrapper"'}`

  if (skipExport) {
    return `${moduleBase}
${fnPostMdxTypeProp}`
  }

  if (wrapExport) {
    return `${moduleBase}
${fnPostMdxTypeProp}
export default ${wrapExport}(MDXContent)`
  }

  return `${moduleBase}
export default ${fnPostMdxTypeProp}`
}

function serializeElement(node, options, parentNode) {
  const parentName = parentNode.tagName
  const {type, props} = toH(
    fakeReactCreateElement,
    Object.assign({}, node, {children: []}),
    {prefix: false}
  )
  const content = serializeChildren(node, options)

  delete props.key
  const data = parentName ? {...props, parentName} : props

  const spread =
    Object.keys(data).length === 0 ? null : ' {...' + JSON.stringify(data) + '}'

  return (
    '<' +
    type +
    (spread ? ' ' + spread : '') +
    (content ? '>' + content + '</' + type + '>' : '/>')
  )
}

function serializeComponent(node, options) {
  const tags = serializeTags(node)
  let content = serializeChildren(node, options)

  if (node.type === 'mdxJsxFlowElement' && content) {
    content = '\n' + content + '\n'
  }

  return tags.open + content + (tags.close || '')
}

function serializeText(node, options, parentNode) {
  // Don't wrap newlines unless specifically instructed to by the flag,
  // to avoid issues like React warnings caused by text nodes in tables.
  const preserveNewlines =
    options.preserveNewlines || parentNode.tagName === 'p'

  if (node.value === '\n' && !preserveNewlines) {
    return node.value
  }

  return toTemplateLiteral(node.value)
}

function serializeChildren(node, options) {
  const children = node.children || []
  const childOptions = Object.assign({}, options, {
    // Tell all children inside <pre> tags to preserve newlines as text nodes
    preserveNewlines: options.preserveNewlines || node.tagName === 'pre'
  })

  return children.map(child => toJSX(child, node, childOptions)).join('\n')
}

// We only do this for the props, so we’re ignoring children.
function fakeReactCreateElement(name, props) {
  return {
    type: name,
    props: props,
    // Needed for `toH` to think this is React.
    key: null,
    _owner: null
  }
}

function toTemplateLiteral(value) {
  const escaped = value
    .replace(/\\(?!\$)/g, '\\\\') // Escape all "\" to avoid unwanted escaping in text nodes
    // and ignore "\$" since it's already escaped and is common
    // with prettier https://github.com/mdx-js/mdx/issues/606
    .replace(/`/g, '\\`') // Escape "`"" since
    .replace(/(\\\$)/g, '\\$1') // Escape \$ so render it as it is
    .replace(/(\\\$)(\{)/g, '\\$1\\$2') // Escape \${} so render it as it is
    .replace(/\$\{/g, '\\${') // Escape ${} in text so that it doesn't eval

  return '{`' + escaped + '`}'
}

function compile(options = {}) {
  function compiler(tree) {
    return toJSX(tree, undefined, options)
  }

  this.Compiler = compiler
}

module.exports = compile
compile.default = compile
compile.toJSX = toJSX

// To do: this is all extracted (and simplified) from `mdast-util-mdx-jsx` for
// now.
// We can remove it when we drop JSX!

const eol = /\r?\n|\r/g

function serializeTags(node) {
  const selfClosing = node.name && (!node.children || !node.children.length)
  const attributes = []
  let index = -1
  let attribute
  let result

  // None.
  if (node.attributes && node.attributes.length) {
    if (!node.name) {
      throw new Error('Cannot serialize fragment w/ attributes')
    }

    while (++index < node.attributes.length) {
      attribute = node.attributes[index]

      if (attribute.type === 'mdxJsxExpressionAttribute') {
        result = '{' + (attribute.value || '') + '}'
      } else {
        if (!attribute.name) {
          throw new Error('Cannot serialize attribute w/o name')
        }

        result =
          attribute.name +
          (attribute.value == null
            ? ''
            : '=' +
              (typeof attribute.value === 'object'
                ? '{' + (attribute.value.value || '') + '}'
                : '"' + encode(attribute.value, {subset: ['"']}) + '"'))
      }

      attributes.push(result)
    }
  }

  return {
    open:
      '<' +
      (node.name || '') +
      (node.type === 'mdxJsxFlowElement' && attributes.length > 1
        ? // Flow w/ multiple attributes.
          '\n' + indent(attributes.join('\n')) + '\n'
        : attributes.length // Text or flow w/ a single attribute.
        ? ' ' + dedentStart(indent(attributes.join(' ')))
        : '') +
      (selfClosing ? '/' : '') +
      '>',
    close: selfClosing ? '' : '</' + (node.name || '') + '>'
  }
}

function serializeMdxExpression(node) {
  const value = node.value || ''
  return '{' + (node.type === 'mdxFlowExpression' ? indent(value) : value) + '}'
}

function dedentStart(value) {
  return value.replace(/^ +/, '')
}

function indent(value) {
  const result = []
  let start = 0
  let match

  while ((match = eol.exec(value))) {
    one(value.slice(start, match.index))
    result.push(match[0])
    start = match.index + match[0].length
  }

  one(value.slice(start))

  return result.join('')

  function one(slice) {
    result.push((slice ? '  ' : '') + slice)
  }
}
