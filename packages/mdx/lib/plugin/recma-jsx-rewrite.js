/**
 * @typedef {import('estree-jsx').Node} Node
 * @typedef {import('estree-jsx').Expression} Expression
 * @typedef {import('estree-jsx').Function} ESFunction
 * @typedef {import('estree-jsx').ImportSpecifier} ImportSpecifier
 * @typedef {import('estree-jsx').JSXElement} JSXElement
 * @typedef {import('estree-jsx').JSXIdentifier} JSXIdentifier
 * @typedef {import('estree-jsx').JSXMemberExpression} JSXMemberExpression
 * @typedef {import('estree-jsx').JSXNamespacedName} JSXNamespacedName
 * @typedef {import('estree-jsx').ModuleDeclaration} ModuleDeclaration
 * @typedef {import('estree-jsx').Program} Program
 * @typedef {import('estree-jsx').Property} Property
 * @typedef {import('estree-jsx').Statement} Statement
 * @typedef {import('estree-jsx').VariableDeclarator} VariableDeclarator
 *
 * @typedef {import('estree-walker').SyncHandler} WalkHandler
 *
 * @typedef {import('periscopic').Scope & {node: Node}} Scope
 *
 * @typedef RecmaJsxRewriteOptions
 * @property {'program'|'function-body'} [outputFormat='program'] Whether to use an import statement or `arguments[0]` to get the provider
 * @property {string} [providerImportSource] Place to import a provider from
 *
 * @typedef StackEntry
 * @property {Array.<string>} objects
 * @property {Array.<string>} components
 * @property {Array.<string>} tags
 * @property {ESFunction} node
 */

import {name as isIdentifierName} from 'estree-util-is-identifier-name'
import {walk} from 'estree-walker'
import {analyze} from 'periscopic'
import {specifiersToDeclarations} from '../util/estree-util-specifiers-to-declarations.js'

/**
 * A plugin that rewrites JSX in functions to accept components as
 * `props.components` (when the function is called `MDXContent`), or from
 * a provider (if there is one).
 * It also makes sure that any undefined components are defined: either from
 * received components or as a function that throws an error.
 *
 * @type {import('unified').Plugin<[RecmaJsxRewriteOptions]|[], Program>}
 */
export function recmaJsxRewrite(options = {}) {
  const {providerImportSource, outputFormat} = options

  return (tree) => {
    // Find everything that’s defined in the top-level scope.
    const scopeInfo = analyze(tree)
    /** @type {Array.<StackEntry>} */
    const fnStack = []
    /** @type {boolean|undefined} */
    let importProvider
    /** @type {Scope|null} */
    let currentScope

    walk(tree, {
      enter(_node) {
        const node = /** @type {Node} */ (_node)

        if (
          node.type === 'FunctionDeclaration' ||
          node.type === 'FunctionExpression' ||
          node.type === 'ArrowFunctionExpression'
        ) {
          fnStack.push({objects: [], components: [], tags: [], node})
        }

        const fnScope = fnStack[0]

        if (
          !fnScope ||
          (!isMdxContent(fnScope.node) && !providerImportSource)
        ) {
          return
        }

        const newScope = /** @type {Scope|undefined} */ (
          // @ts-expect-error: periscopic doesn’t support JSX.
          scopeInfo.map.get(node)
        )

        if (newScope) {
          newScope.node = node
          currentScope = newScope
        }

        if (currentScope && node.type === 'JSXElement') {
          let name = node.openingElement.name

          // `<x.y>`, `<Foo.Bar>`, `<x.y.z>`.
          if (name.type === 'JSXMemberExpression') {
            // Find the left-most identifier.
            while (name.type === 'JSXMemberExpression') name = name.object

            const id = name.name

            if (!fnScope.objects.includes(id) && !inScope(currentScope, id)) {
              fnScope.objects.push(id)
            }
          }
          // `<xml:thing>`.
          else if (name.type === 'JSXNamespacedName') {
            // Ignore namespaces.
          }
          // If the name is a valid ES identifier, and it doesn’t start with a
          // lowercase letter, it’s a component.
          // For example, `$foo`, `_bar`, `Baz` are all component names.
          // But `foo` and `b-ar` are tag names.
          else if (isIdentifierName(name.name) && !/^[a-z]/.test(name.name)) {
            const id = name.name

            if (
              !fnScope.components.includes(id) &&
              !inScope(currentScope, id)
            ) {
              fnScope.components.push(id)
            }
          }
          // @ts-expect-error Allow fields passed through from mdast through hast to
          // esast.
          else if (node.data && node.data._mdxExplicitJsx) {
            // Do not turn explicit JSX into components from `_components`.
            // As in, a given `h1` component is used for `# heading` (next case),
            // but not for `<h1>heading</h1>`.
          } else {
            const id = name.name

            if (!fnScope.tags.includes(id)) {
              fnScope.tags.push(id)
            }

            node.openingElement.name = {
              type: 'JSXMemberExpression',
              object: {type: 'JSXIdentifier', name: '_components'},
              property: name
            }

            if (node.closingElement) {
              node.closingElement.name = {
                type: 'JSXMemberExpression',
                object: {type: 'JSXIdentifier', name: '_components'},
                property: {type: 'JSXIdentifier', name: id}
              }
            }
          }
        }
      },
      leave(node) {
        /** @type {Array.<Property>} */
        const defaults = []
        /** @type {Array.<string>} */
        const actual = []
        /** @type {Array.<Expression>} */
        const parameters = []
        /** @type {Array.<VariableDeclarator>} */
        const declarations = []

        if (currentScope && currentScope.node === node) {
          // @ts-expect-error: `node`s were patched when entering.
          currentScope = currentScope.parent
        }

        if (
          node.type === 'FunctionDeclaration' ||
          node.type === 'FunctionExpression' ||
          node.type === 'ArrowFunctionExpression'
        ) {
          const fn = /** @type {ESFunction} */ (node)
          const scope = fnStack[fnStack.length - 1]
          /** @type {string} */
          let name

          for (name of scope.tags) {
            defaults.push({
              type: 'Property',
              kind: 'init',
              key: {type: 'Identifier', name},
              value: {type: 'Literal', value: name},
              method: false,
              shorthand: false,
              computed: false
            })
          }

          actual.push(...scope.components)

          for (name of scope.objects) {
            // In some cases, a component is used directly (`<X>`) but it’s also
            // used as an object (`<X.Y>`).
            if (!actual.includes(name)) {
              actual.push(name)
            }
          }

          if (defaults.length > 0 || actual.length > 0) {
            parameters.push({type: 'ObjectExpression', properties: defaults})

            if (providerImportSource) {
              importProvider = true
              parameters.push({
                type: 'CallExpression',
                callee: {type: 'Identifier', name: '_provideComponents'},
                arguments: [],
                optional: false
              })
            }

            // Accept `components` as a prop if this is the `MDXContent` function.
            if (isMdxContent(scope.node)) {
              parameters.push({
                type: 'MemberExpression',
                object: {type: 'Identifier', name: 'props'},
                property: {type: 'Identifier', name: 'components'},
                computed: false,
                optional: false
              })
            }

            declarations.push({
              type: 'VariableDeclarator',
              id: {type: 'Identifier', name: '_components'},
              init: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: {type: 'Identifier', name: 'Object'},
                  property: {type: 'Identifier', name: 'assign'},
                  computed: false,
                  optional: false
                },
                arguments: parameters,
                optional: false
              }
            })

            // Add components to scope.
            // For `['MyComponent', 'MDXLayout']` this generates:
            // ```js
            // const {MyComponent, wrapper: MDXLayout} = _components
            // ```
            // Note that MDXLayout is special as it’s taken from
            // `_components.wrapper`.
            if (actual.length > 0) {
              declarations.push({
                type: 'VariableDeclarator',
                id: {
                  type: 'ObjectPattern',
                  properties: actual.map((name) => ({
                    type: 'Property',
                    kind: 'init',
                    key: {
                      type: 'Identifier',
                      name: name === 'MDXLayout' ? 'wrapper' : name
                    },
                    value: {type: 'Identifier', name},
                    method: false,
                    shorthand: name !== 'MDXLayout',
                    computed: false
                  }))
                },
                init: {type: 'Identifier', name: '_components'}
              })
            }

            // Arrow functions with an implied return:
            if (fn.body.type !== 'BlockStatement') {
              fn.body = {
                type: 'BlockStatement',
                body: [{type: 'ReturnStatement', argument: fn.body}]
              }
            }

            fn.body.body.unshift({
              type: 'VariableDeclaration',
              kind: 'const',
              declarations
            })
          }

          fnStack.pop()
        }
      }
    })

    // If a provider is used (and can be used), import it.
    if (importProvider && providerImportSource) {
      tree.body.unshift(
        createImportProvider(providerImportSource, outputFormat)
      )
    }
  }
}

/**
 * @param {string} providerImportSource
 * @param {RecmaJsxRewriteOptions['outputFormat']} outputFormat
 * @returns {Statement|ModuleDeclaration}
 */
function createImportProvider(providerImportSource, outputFormat) {
  /** @type {Array<ImportSpecifier>} */
  const specifiers = [
    {
      type: 'ImportSpecifier',
      imported: {type: 'Identifier', name: 'useMDXComponents'},
      local: {type: 'Identifier', name: '_provideComponents'}
    }
  ]

  return outputFormat === 'function-body'
    ? {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: specifiersToDeclarations(specifiers, {
          type: 'MemberExpression',
          object: {type: 'Identifier', name: 'arguments'},
          property: {type: 'Literal', value: 0},
          computed: true,
          optional: false
        })
      }
    : {
        type: 'ImportDeclaration',
        specifiers,
        source: {type: 'Literal', value: providerImportSource}
      }
}

/**
 * @param {ESFunction} [node]
 * @returns {boolean}
 */
function isMdxContent(node) {
  return Boolean(
    node && 'id' in node && node.id && node.id.name === 'MDXContent'
  )
}

/**
 * @param {Scope} scope
 * @param {string} id
 */
function inScope(scope, id) {
  /** @type {Scope|null} */
  let currentScope = scope

  while (currentScope) {
    if (currentScope.declarations.has(id)) {
      return true
    }

    // @ts-expect-error: `node`s have been added when entering.
    currentScope = currentScope.parent
  }

  return false
}
