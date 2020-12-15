const {transformFromAstSync} = require('@babel/core')
const generate = require('@babel/generator').default
const uniq = require('lodash.uniq')
const toEstree = require('hast-util-to-estree')
const estreeToBabel = require('estree-to-babel')
const BabelPluginApplyMdxProp = require('babel-plugin-apply-mdx-type-prop')
const BabelPluginExtractImportNames = require('babel-plugin-extract-import-names')
const BabelPluginExtractExportNames = require('babel-plugin-extract-export-names')

function serializeEstree(estree, options) {
  const {
    // Default options
    skipExport = false,
    wrapExport
  } = options

  let layout
  let children = []

  // Find the `export default`, the JSX expression, and leave the rest
  // (import/exports) as they are.
  estree.body = estree.body.filter(child => {
    if (child.type === 'ExportDefaultDeclaration') {
      layout = child.declaration
      return false
    }

    if (
      child.type === 'ExpressionStatement' &&
      (child.expression.type === 'JSXFragment' ||
        child.expression.type === 'JSXElement')
    ) {
      children =
        child.expression.type === 'JSXFragment'
          ? child.expression.children
          : [child.expression]
      return false
    }

    return true
  })

  estree.body = [
    ...estree.body,
    ...createMdxLayout(layout),
    ...createMdxContent(children)
  ]

  // Now, transform the whole with Babel.
  const babelTree = estreeToBabel(estree)

  // Get all the identifiers that are imported or exported (as those might be
  // component names).
  const babelPluginExtractImportNamesInstance = new BabelPluginExtractImportNames()
  const babelPluginExtractExportNamesInstance = new BabelPluginExtractExportNames()
  // Get all used JSX identifiers (`mdxType` props).
  const babelPluginApplyMdxPropInstance = new BabelPluginApplyMdxProp()

  // Mutate the Babel AST.
  transformFromAstSync(babelTree, '', {
    filename: options.filename,
    ast: false,
    code: false,
    cloneInputAst: false,
    configFile: false,
    babelrc: false,
    plugins: [
      babelPluginExtractImportNamesInstance.plugin,
      babelPluginExtractExportNamesInstance.plugin,
      babelPluginApplyMdxPropInstance.plugin
    ]
  })

  const importExportNames = babelPluginExtractImportNamesInstance.state.names.concat(
    babelPluginExtractExportNamesInstance.state.names
  )
  const jsxNames = babelPluginApplyMdxPropInstance.state.names.filter(
    name => name !== 'MDXLayout'
  )

  const shortcodes = createMakeShortcodeHelper(
    uniq(jsxNames).filter(name => !importExportNames.includes(name))
  )

  const exports = []

  if (!skipExport) {
    let declaration = {type: 'Identifier', name: 'MDXContent'}

    if (wrapExport) {
      declaration = {
        type: 'CallExpression',
        callee: {type: 'Identifier', name: wrapExport},
        arguments: [declaration]
      }
    }

    exports.push({type: 'ExportDefaultDeclaration', declaration: declaration})
  }

  babelTree.program.body = [
    ...shortcodes,
    ...babelTree.program.body,
    ...exports
  ]

  return generate(babelTree).code
}

function compile(options = {}) {
  function compiler(tree, file) {
    return serializeEstree(toEstree(tree), {
      filename: (file || {}).path,
      ...options
    })
  }

  this.Compiler = compiler
}

module.exports = compile
compile.default = compile

function createMdxContent(children) {
  return [
    {
      type: 'FunctionDeclaration',
      id: {type: 'Identifier', name: 'MDXContent'},
      expression: false,
      generator: false,
      async: false,
      params: [
        {
          type: 'ObjectPattern',
          properties: [
            {
              type: 'Property',
              method: false,
              shorthand: true,
              computed: false,
              key: {type: 'Identifier', name: 'components'},
              kind: 'init',
              value: {type: 'Identifier', name: 'components'}
            },
            {type: 'RestElement', argument: {type: 'Identifier', name: 'props'}}
          ]
        }
      ],
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'ReturnStatement',
            argument: {
              type: 'JSXElement',
              openingElement: {
                type: 'JSXOpeningElement',
                attributes: [
                  {
                    type: 'JSXAttribute',
                    name: {type: 'JSXIdentifier', name: 'components'},
                    value: {
                      type: 'JSXExpressionContainer',
                      expression: {type: 'Identifier', name: 'components'}
                    }
                  },
                  {
                    type: 'JSXSpreadAttribute',
                    argument: {type: 'Identifier', name: 'props'}
                  }
                ],
                name: {type: 'JSXIdentifier', name: 'MDXLayout'},
                selfClosing: false
              },
              closingElement: {
                type: 'JSXClosingElement',
                name: {type: 'JSXIdentifier', name: 'MDXLayout'}
              },
              children: children
            }
          }
        ]
      }
    },
    {
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'MDXContent'},
          property: {type: 'Identifier', name: 'isMDXComponent'},
          computed: false,
          optional: false
        },
        right: {type: 'Literal', value: true, raw: 'true'}
      }
    }
  ]
}

function createMdxLayout(declaration) {
  return [
    {
      type: 'VariableDeclaration',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: {type: 'Identifier', name: 'MDXLayout'},
          init: declaration || {
            type: 'Literal',
            value: 'wrapper',
            raw: '"wrapper"'
          }
        }
      ],
      kind: 'const'
    }
  ]
}

// Note: this creates a Babel AST, not an estree.
function createMakeShortcodeHelper(names) {
  const func = {
    type: 'VariableDeclaration',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: {type: 'Identifier', name: 'makeShortcode'},
        init: {
          type: 'ArrowFunctionExpression',
          id: null,
          expression: true,
          generator: false,
          async: false,
          params: [{type: 'Identifier', name: 'name'}],
          body: {
            type: 'ArrowFunctionExpression',
            id: null,
            expression: false,
            generator: false,
            async: false,
            params: [{type: 'Identifier', name: 'props'}],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: {
                      type: 'MemberExpression',
                      object: {type: 'Identifier', name: 'console'},
                      property: {type: 'Identifier', name: 'warn'},
                      computed: false,
                      optional: false
                    },
                    arguments: [
                      {
                        // Note: Babel!
                        type: 'StringLiteral',
                        value:
                          'Component `%s` was not imported, exported, or provided by MDXProvider as global scope'
                      },
                      {type: 'Identifier', name: 'name'}
                    ]
                  }
                },
                {
                  type: 'ReturnStatement',
                  argument: {
                    type: 'JSXElement',
                    openingElement: {
                      type: 'JSXOpeningElement',
                      attributes: [
                        {
                          type: 'JSXSpreadAttribute',
                          argument: {type: 'Identifier', name: 'props'}
                        }
                      ],
                      name: {type: 'JSXIdentifier', name: 'div'},
                      selfClosing: true
                    },
                    closingElement: null,
                    children: []
                  }
                }
              ]
            }
          }
        }
      }
    ],
    kind: 'const'
  }

  const shortcodes = names.map(name => ({
    type: 'VariableDeclaration',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: {type: 'Identifier', name: String(name)},
        init: {
          type: 'CallExpression',
          callee: {type: 'Identifier', name: 'makeShortcode'},
          // Note: Babel!
          arguments: [{type: 'StringLiteral', value: String(name)}]
        }
      }
    ],
    kind: 'const'
  }))

  return shortcodes.length > 0 ? [func, ...shortcodes] : []
}
