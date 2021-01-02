const toEstree = require('hast-util-to-estree')
const isIdentifierName = require('estree-util-is-identifier-name').name
const walk = require('estree-walker').walk
const periscopic = require('periscopic')
const estreeToJs = require('./estree-to-js')

const own = {}.hasOwnProperty

const tags = [
  'a',
  'blockquote',
  'code',
  'del',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'inlineCode',
  'li',
  'ol',
  'p',
  'pre',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul'
]

const parentChildComponents = {
  li: ['ol', 'ul'],
  p: ['blockquote']
}

const componentDefaults = {
  inlineCode: 'code'
}

function serializeEstree(estree, options) {
  const {
    // Default options
    skipExport = false,
    wrapExport,
    mdxProviderImportSource = '@mdx-js/react',

    jsxImportSource,
    jsxRuntime = jsxImportSource ? 'automatic' : 'classic',
    pragma = 'React.createElement',
    pragmaFrag = 'React.Fragment'
  } = options

  const comments = []
  const doc = []
  let hasMdxLayout
  let hasMdxContent

  if (jsxRuntime) {
    comments.push({type: 'Block', value: '@jsxRuntime ' + jsxRuntime})
  }

  if (jsxRuntime === 'automatic' && jsxImportSource) {
    comments.push({type: 'Block', value: '@jsxImportSource ' + jsxImportSource})
  }

  if (jsxRuntime === 'classic' && pragma) {
    comments.push({type: 'Block', value: '@jsx ' + pragma})
  }

  if (jsxRuntime === 'classic' && pragmaFrag) {
    comments.push({type: 'Block', value: '@jsxFrag ' + pragmaFrag})
  }

  // Add JSX pragma comments.
  estree.comments.unshift(...comments)

  // Find the `export default`, the JSX expression, and leave the rest
  // (import/exports) as they are.
  estree.body.forEach(child => {
    // ```js
    // export default props => <>{props.children}</>
    // ```
    //
    // Treat it as an inline layout declaration.
    if (!hasMdxLayout && child.type === 'ExportDefaultDeclaration') {
      hasMdxLayout = true
      doc.push({
        type: 'VariableDeclaration',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {type: 'Identifier', name: 'MDXLayout'},
            init: child.declaration
          }
        ],
        kind: 'const'
      })
    }
    // Look for default “reexports”.
    //
    // ```js
    // export {default} from "a"
    // export {default as a} from "b"
    // export {default as a, b} from "c"
    // export {a as default} from "b"
    // export {a as default, b} from "c"
    // ```
    else if (child.type === 'ExportNamedDeclaration' && child.source) {
      // Remove `default` or `as default`, but not `default as`, specifier.
      child.specifiers = child.specifiers.filter(specifier => {
        if (!hasMdxLayout && specifier.exported.name === 'default') {
          hasMdxLayout = true
          // Make it just an import: `import MDXLayout from "..."`.
          doc.push({
            type: 'ImportDeclaration',
            specifiers: [
              // Default as default / something else as default.
              specifier.local.name === 'default'
                ? {
                    type: 'ImportDefaultSpecifier',
                    local: {type: 'Identifier', name: 'MDXLayout'}
                  }
                : {
                    type: 'ImportSpecifier',
                    imported: specifier.local,
                    local: {type: 'Identifier', name: 'MDXLayout'}
                  }
            ],
            source: {type: 'Literal', value: child.source.value}
          })

          return false
        }

        return true
      })

      // If there are other things imported, keep it.
      if (child.specifiers.length) {
        doc.push(child)
      }
    } else if (
      child.type === 'ExpressionStatement' &&
      (child.expression.type === 'JSXFragment' ||
        child.expression.type === 'JSXElement')
    ) {
      let expression = child.expression

      // Depending on the hast, we’ll almost always have a fragment.
      // Use a `<div>` if fragments are not supported.
      if (expression.type === 'JSXFragment' && options.mdxFragment === false) {
        expression = {
          type: 'JSXElement',
          openingElement: {
            type: 'JSXOpeningElement',
            attributes: [],
            name: {type: 'JSXIdentifier', name: 'div'}
          },
          closingElement: {
            type: 'JSXClosingElement',
            name: {type: 'JSXIdentifier', name: 'div'}
          },
          children: expression.children
        }
      }

      hasMdxContent = true
      doc.push(...createMdxContent(expression))
    } else {
      doc.push(child)
    }
  })

  // If there was no JSX content at all, add an empty function.
  if (!hasMdxContent) {
    doc.push(...createMdxContent())
  }

  if (!skipExport) {
    let declaration = {type: 'Identifier', name: 'MDXContent'}

    if (wrapExport) {
      declaration = {
        type: 'CallExpression',
        callee: {type: 'Identifier', name: wrapExport},
        arguments: [declaration]
      }
    }

    doc.push({type: 'ExportDefaultDeclaration', declaration: declaration})
  }

  estree.body = doc

  const info = rewriteIdentifiers(estree, {
    ...options,
    // Find everything that’s defined in the top-level scope.
    inTopScope: [...periscopic.analyze(estree).scope.declarations.keys()]
  })

  // If there are “shortcodes” (undefined components expected to be passed),
  // add the helper.
  if (info.useShortcodeHelper) {
    estree.body.unshift(
      createShortcodeFallbackHelper(options.mdxFragment === false)
    )
  }

  // Import the provider when needed.
  if (info.useProvidedComponentsHelper) {
    estree.body.unshift({
      type: 'ImportDeclaration',
      specifiers: [
        {
          type: 'ImportSpecifier',
          imported: {type: 'Identifier', name: 'useMDXComponents'},
          local: {type: 'Identifier', name: '__provideComponents'}
        }
      ],
      source: {type: 'Literal', value: mdxProviderImportSource}
    })
  }

  return estreeToJs(estree)
}

function compile(options = {}) {
  function compiler(tree) {
    return serializeEstree(toEstree(tree), options)
  }

  this.Compiler = compiler
}

module.exports = compile
compile.default = compile

function rewriteIdentifiers(estree, options) {
  const stack = []
  let useShortcodeHelper = false
  let useProvidedComponentsHelper = false

  walk(estree, {
    // eslint-disable-next-line complexity
    enter: function (node) {
      if (
        node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' ||
        node.type === 'ArrowFunctionExpression'
      ) {
        stack.push({
          node,
          objects: [],
          components: [],
          markdownComponents: [],
          elements: []
        })
      }

      if (node.type === 'JSXElement' && stack.length) {
        // Note: inject into the top-level function that contains JSX.
        const scope = stack[0]
        const nameNode = node.openingElement.name

        // `<x.y>`, `<Foo.Bar>`, `<x.y.z>`.
        if (nameNode.type === 'JSXMemberExpression') {
          let left = nameNode

          while (left.type === 'JSXMemberExpression') {
            left = left.object
          }

          // `left` is now always an identifier.
          if (!scope.objects.includes(left.name)) {
            scope.objects.push(left.name)
          }
        }
        // `<xml:thing>`.
        else if (nameNode.type === 'JSXNamespacedName') {
          // Ignore namespaces.
        } else {
          const name = nameNode.name
          // If the name is a valid ES identifier, and it doesn’t start with a
          // lowecase letter, it’s a component.
          // For example, `$foo`, `_bar`, `Baz` are all component names.
          // But `foo` and `b-ar` are tag names.
          if (isIdentifierName(name) && !/^[a-z]/.test(name)) {
            if (!scope.components.includes(name)) {
              scope.components.push(name)
            }
          } else if (tags.includes(name)) {
            let selector = name
            const parent = scope.elements[scope.elements.length - 1]

            if (
              own.call(parentChildComponents, name) &&
              parent &&
              parent.openingElement.name.type === 'JSXMemberExpression' &&
              parent.openingElement.name.object.type === 'JSXIdentifier' &&
              parent.openingElement.name.object.name === '__components' &&
              parentChildComponents[name].includes(
                parent.openingElement.name.property.name
              )
            ) {
              selector = parent.openingElement.name.property.name + '.' + name
            }

            if (!scope.markdownComponents.includes(selector)) {
              scope.markdownComponents.push(selector)
            }

            node.openingElement.name = {
              type: 'JSXMemberExpression',
              object: {type: 'JSXIdentifier', name: '__components'},
              property: {
                type: 'JSXIdentifier',
                name: selectorToIdentifierName(selector)
              }
            }

            if (node.closingElement) {
              node.closingElement.name = {
                type: 'JSXMemberExpression',
                object: {type: 'JSXIdentifier', name: '__components'},
                property: {
                  type: 'JSXIdentifier',
                  name: selectorToIdentifierName(selector)
                }
              }
            }
          }
        }

        scope.elements.push(node)
      }
    },
    leave: function (node) {
      if (
        node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' ||
        node.type === 'ArrowFunctionExpression'
      ) {
        const scope = stack.pop()
        const info = injectComponents(scope.node, scope, options)

        if (info.useShortcodeHelper) useShortcodeHelper = true
        if (info.useProvidedComponentsHelper) useProvidedComponentsHelper = true
      }

      if (node.type === 'JSXElement' && stack.length) {
        stack[stack.length - 1].elements.pop()
      }
    }
  })

  return {useShortcodeHelper, useProvidedComponentsHelper}
}

function injectComponents(func, state, options) {
  const {inTopScope, mdxProviderImportSource = '@mdx-js/react'} = options
  const markdownComponents = [
    ...new Set(
      state.markdownComponents.map(member => member.split('.').pop()).sort()
    )
  ]
  const parentalMarkdownComponents = state.markdownComponents
    .filter(member => member.indexOf('.') > -1)
    .sort()
  const components = state.components.filter(id => !inTopScope.includes(id))
  const requiredComponents = components.filter(id => id !== 'MDXLayout')
  const objects = state.objects.filter(id => !inTopScope.includes(id))
  const isMdxContent =
    func.type === 'FunctionDeclaration' && func.id.name === 'MDXContent'
  const injectLayout = isMdxContent && !inTopScope.includes('MDXLayout')
  const nodes = []
  let useShortcodeHelper = false
  let useProvidedComponentsHelper = false

  // We need to define some variables, add them here:
  let declarations = []

  if (
    markdownComponents.length ||
    components.length ||
    objects.length ||
    injectLayout
  ) {
    useShortcodeHelper = requiredComponents.length > 0

    const parameters = [
      {
        type: 'ObjectExpression',
        properties: [
          ...markdownComponents.map(member => ({
            type: 'Property',
            key: {type: 'Identifier', name: member},
            value: {
              type: 'Literal',
              value:
                member in componentDefaults ? componentDefaults[member] : member
            },
            kind: 'init'
          })),
          ...requiredComponents.map(id => ({
            type: 'Property',
            key: {type: 'Identifier', name: id},
            value: {
              type: 'CallExpression',
              callee: {type: 'Identifier', name: 'mdxShortcodeFallback'},
              arguments: [{type: 'Literal', value: id}]
            },
            kind: 'init'
          }))
        ]
      }
    ]

    // Accept provided components if there is an import source defined.
    if (mdxProviderImportSource) {
      useProvidedComponentsHelper = true
      parameters.push({
        type: 'CallExpression',
        callee: {type: 'Identifier', name: '__provideComponents'},
        arguments: []
      })
    }

    // Accept `components` as a prop if this is the `MDXContent` component.
    if (isMdxContent) {
      parameters.push({
        type: 'MemberExpression',
        object: {type: 'Identifier', name: '__props'},
        property: {type: 'Identifier', name: 'components'}
      })
    }

    declarations.push({
      type: 'VariableDeclarator',
      id: {type: 'Identifier', name: '__components'},
      init:
        parameters.length > 1
          ? {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {type: 'Identifier', name: 'Object'},
                property: {type: 'Identifier', name: 'assign'}
              },
              arguments: parameters
            }
          : parameters[0]
    })

    // Add components to scope.
    // For `['MyComponent', 'MDXLayout']` this generates:
    // ```js
    // const {MyComponent, wrapper: MDXLayout} = __components
    // ```
    // Note that MDXLayout is special as it’s taken from `__components.wrapper`.
    if (components.length || objects.length) {
      declarations.push({
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties: [
            ...objects.map(id => ({
              type: 'Property',
              shorthand: true,
              key: {type: 'Identifier', name: id},
              value: {type: 'Identifier', name: id},
              kind: 'init'
            })),
            ...components.map(id => ({
              type: 'Property',
              shorthand: id !== 'MDXLayout',
              key: {
                type: 'Identifier',
                name: id === 'MDXLayout' ? 'wrapper' : id
              },
              value: {type: 'Identifier', name: id},
              kind: 'init'
            }))
          ]
        },
        init: {type: 'Identifier', name: '__components'}
      })
    }

    // Flush the declared variables.
    nodes.push({
      type: 'VariableDeclaration',
      declarations: declarations,
      kind: 'const'
    })

    if (parentalMarkdownComponents.length) {
      // For `parent.child` combos we default to their child.
      //
      // For `['blockquote.p', 'ol.li']` this generates:
      // ```js
      // __components.blockquoteP = __components['blockquote.p'] || __components.p
      // __components.olLi = __components['ol.li'] || __components.li
      // ```
      parentalMarkdownComponents.forEach(name => {
        nodes.push({
          type: 'ExpressionStatement',
          expression: {
            type: 'AssignmentExpression',
            operator: '=',
            left: {
              type: 'MemberExpression',
              object: {type: 'Identifier', name: '__components'},
              property: {
                type: 'Identifier',
                name: selectorToIdentifierName(name)
              }
            },
            right: {
              type: 'LogicalExpression',
              left: {
                type: 'MemberExpression',
                object: {type: 'Identifier', name: '__components'},
                property: {type: 'Literal', value: name},
                computed: true
              },
              right: {
                type: 'MemberExpression',
                object: {type: 'Identifier', name: '__components'},
                property: {type: 'Identifier', name: name.split('.').pop()}
              },
              operator: '||'
            }
          }
        })
      })
    }
  }

  if (nodes.length) {
    // Arrow functions with an implied return:
    if (func.body.type !== 'BlockStatement') {
      func.body = {
        type: 'BlockStatement',
        body: [{type: 'ReturnStatement', argument: func.body}]
      }
    }

    func.body.body = [...nodes, ...func.body.body]
  }

  return {useShortcodeHelper, useProvidedComponentsHelper}
}

function createMdxContent(content) {
  return [
    {
      type: 'FunctionDeclaration',
      id: {type: 'Identifier', name: 'MDXContent'},
      expression: false,
      generator: false,
      async: false,
      params: [{type: 'Identifier', name: '__props'}],
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'VariableDeclaration',
            declarations: [
              {
                type: 'VariableDeclarator',
                id: {type: 'Identifier', name: '__content'},
                init: content || {type: 'Literal', value: null}
              }
            ],
            kind: 'const'
          },
          {
            type: 'ReturnStatement',
            argument: {
              type: 'ConditionalExpression',
              test: {type: 'Identifier', name: 'MDXLayout'},
              consequent: {
                type: 'JSXElement',
                openingElement: {
                  type: 'JSXOpeningElement',
                  attributes: [
                    {
                      type: 'JSXSpreadAttribute',
                      argument: {type: 'Identifier', name: '__props'}
                    }
                  ],
                  name: {type: 'JSXIdentifier', name: 'MDXLayout'},
                  selfClosing: false
                },
                closingElement: {
                  type: 'JSXClosingElement',
                  name: {type: 'JSXIdentifier', name: 'MDXLayout'}
                },
                children: [
                  {
                    type: 'JSXExpressionContainer',
                    expression: {type: 'Identifier', name: '__content'}
                  }
                ]
              },
              alternate: {type: 'Identifier', name: '__content'}
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

function createShortcodeFallbackHelper(useElement) {
  return {
    type: 'VariableDeclaration',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: {type: 'Identifier', name: 'mdxShortcodeFallback'},
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
            params: [{type: 'Identifier', name: '__props'}],
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
                        type: 'Literal',
                        value:
                          'Component `%s` was not imported, exported, or provided by MDXProvider as global scope'
                      },
                      {type: 'Identifier', name: 'name'}
                    ]
                  }
                },
                {
                  type: 'ReturnStatement',
                  argument: useElement
                    ? {
                        type: 'JSXElement',
                        openingElement: {
                          type: 'JSXOpeningElement',
                          attributes: [
                            {
                              type: 'JSXSpreadAttribute',
                              argument: {type: 'Identifier', name: '__props'}
                            }
                          ],
                          name: {type: 'JSXIdentifier', name: 'div'},
                          selfClosing: true
                        },
                        closingElement: null,
                        children: []
                      }
                    : {
                        type: 'JSXFragment',
                        openingFragment: {type: 'JSXOpeningFragment'},
                        closingFragment: {type: 'JSXClosingFragment'},
                        children: [
                          {
                            type: 'JSXExpressionContainer',
                            expression: {
                              type: 'MemberExpression',
                              object: {type: 'Identifier', name: '__props'},
                              property: {type: 'Identifier', name: 'children'},
                              computed: false
                            }
                          }
                        ]
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
}

function selectorToIdentifierName(selector) {
  return selector.replace(/\../g, replace)

  function replace($0) {
    return $0.charAt(1).toUpperCase()
  }
}
