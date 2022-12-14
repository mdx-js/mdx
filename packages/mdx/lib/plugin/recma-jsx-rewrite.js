/**
 * @typedef {import('estree-jsx').Node} Node
 * @typedef {import('estree-jsx').Expression} Expression
 * @typedef {import('estree-jsx').Function} ESFunction
 * @typedef {import('estree-jsx').ImportSpecifier} ImportSpecifier
 * @typedef {import('estree-jsx').JSXElement} JSXElement
 * @typedef {import('estree-jsx').JSXIdentifier} JSXIdentifier
 * @typedef {import('estree-jsx').JSXNamespacedName} JSXNamespacedName
 * @typedef {import('estree-jsx').ModuleDeclaration} ModuleDeclaration
 * @typedef {import('estree-jsx').Program} Program
 * @typedef {import('estree-jsx').Property} Property
 * @typedef {import('estree-jsx').Statement} Statement
 * @typedef {import('estree-jsx').VariableDeclarator} VariableDeclarator
 * @typedef {import('estree-jsx').ObjectPattern} ObjectPattern
 * @typedef {import('estree-jsx').Identifier} Identifier
 *
 * @typedef {import('estree-walker').SyncHandler} WalkHandler
 *
 * @typedef {import('periscopic').Scope & {node: Node}} Scope
 *
 * @typedef RecmaJsxRewriteOptions
 * @property {'program'|'function-body'} [outputFormat='program']
 *   Whether to use an import statement or `arguments[0]` to get the provider.
 * @property {string} [providerImportSource]
 *   Place to import a provider from.
 * @property {boolean} [development=false]
 *   Whether to add extra info to error messages in generated code.
 *   This also results in the development automatic JSX runtime
 *   (`/jsx-dev-runtime`, `jsxDEV`) being used, which passes positional info to
 *   nodes.
 *   The default can be set to `true` in Node.js through environment variables:
 *   set `NODE_ENV=development`.
 *
 * @typedef StackEntry
 * @property {Array<string>} objects
 * @property {Array<string>} components
 * @property {Array<string>} tags
 * @property {Record<string, {node: JSXElement, component: boolean}>} references
 * @property {Map<string|number, string>} idToInvalidComponentName
 * @property {ESFunction} node
 */

import {stringifyPosition} from 'unist-util-stringify-position'
import {positionFromEstree} from 'unist-util-position-from-estree'
import {name as isIdentifierName} from 'estree-util-is-identifier-name'
import {walk} from 'estree-walker'
import {analyze} from 'periscopic'
import {specifiersToDeclarations} from '../util/estree-util-specifiers-to-declarations.js'
import {
  toIdOrMemberExpression,
  toJsxIdOrMemberExpression
} from '../util/estree-util-to-id-or-member-expression.js'
import {toBinaryAddition} from '../util/estree-util-to-binary-addition.js'

const own = {}.hasOwnProperty

/**
 * A plugin that rewrites JSX in functions to accept components as
 * `props.components` (when the function is called `_createMdxContent`), or from
 * a provider (if there is one).
 * It also makes sure that any undefined components are defined: either from
 * received components or as a function that throws an error.
 *
 * @type {import('unified').Plugin<[RecmaJsxRewriteOptions]|[], Program>}
 */
export function recmaJsxRewrite(options = {}) {
  const {development, providerImportSource, outputFormat} = options

  return (tree, file) => {
    // Find everything that’s defined in the top-level scope.
    const scopeInfo = analyze(tree)
    /** @type {Array<StackEntry>} */
    const fnStack = []
    /** @type {boolean|undefined} */
    let importProvider
    /** @type {boolean|undefined} */
    let createErrorHelper
    /** @type {Scope|null} */
    let currentScope

    walk(tree, {
      enter(_node) {
        const node = /** @type {Node} */ (_node)
        const newScope = /** @type {Scope|undefined} */ (
          scopeInfo.map.get(node)
        )

        if (
          node.type === 'FunctionDeclaration' ||
          node.type === 'FunctionExpression' ||
          node.type === 'ArrowFunctionExpression'
        ) {
          fnStack.push({
            objects: [],
            components: [],
            tags: [],
            references: {},
            idToInvalidComponentName: new Map(),
            node
          })

          // MDXContent only ever contains MDXLayout
          if (
            isNamedFunction(node, 'MDXContent') &&
            newScope &&
            !inScope(newScope, 'MDXLayout')
          ) {
            fnStack[0].components.push('MDXLayout')
          }
        }

        const fnScope = fnStack[0]
        if (
          !fnScope ||
          (!isNamedFunction(fnScope.node, '_createMdxContent') &&
            !providerImportSource)
        ) {
          return
        }

        if (newScope) {
          newScope.node = node
          currentScope = newScope
        }

        if (currentScope && node.type === 'JSXElement') {
          let name = node.openingElement.name

          // `<x.y>`, `<Foo.Bar>`, `<x.y.z>`.
          if (name.type === 'JSXMemberExpression') {
            /** @type {Array<string>} */
            const ids = []

            // Find the left-most identifier.
            while (name.type === 'JSXMemberExpression') {
              ids.unshift(name.property.name)
              name = name.object
            }

            ids.unshift(name.name)
            const fullId = ids.join('.')
            const id = name.name

            const isInScope = inScope(currentScope, id)

            if (!own.call(fnScope.references, fullId)) {
              const parentScope = /** @type {Scope|null} */ (
                currentScope.parent
              )
              if (
                !isInScope ||
                // If the parent scope is `_createMdxContent`, then this
                // references a component we can add a check statement for.
                (parentScope &&
                  parentScope.node.type === 'FunctionDeclaration' &&
                  isNamedFunction(parentScope.node, '_createMdxContent'))
              ) {
                fnScope.references[fullId] = {node, component: true}
              }
            }

            if (!fnScope.objects.includes(id) && !isInScope) {
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

            if (!inScope(currentScope, id)) {
              // No need to add an error for an undefined layout — we use an
              // `if` later.
              if (id !== 'MDXLayout' && !own.call(fnScope.references, id)) {
                fnScope.references[id] = {node, component: true}
              }

              if (!fnScope.components.includes(id)) {
                fnScope.components.push(id)
              }
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

            /** @type {Array<string | number>} */
            let jsxIdExpression = ['_components', id]
            if (isIdentifierName(id) === false) {
              let invalidComponentName =
                fnScope.idToInvalidComponentName.get(id)
              if (invalidComponentName === undefined) {
                invalidComponentName = `_component${fnScope.idToInvalidComponentName.size}`
                fnScope.idToInvalidComponentName.set(id, invalidComponentName)
              }

              jsxIdExpression = [invalidComponentName]
            }

            node.openingElement.name =
              toJsxIdOrMemberExpression(jsxIdExpression)

            if (node.closingElement) {
              node.closingElement.name =
                toJsxIdOrMemberExpression(jsxIdExpression)
            }
          }
        }
      },
      leave(node) {
        /** @type {Array<Property>} */
        const defaults = []
        /** @type {Array<string>} */
        const actual = []
        /** @type {Array<Expression>} */
        const parameters = []
        /** @type {Array<VariableDeclarator>} */
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
              key: isIdentifierName(name)
                ? {type: 'Identifier', name}
                : {type: 'Literal', value: name},
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

          /** @type {Array<Statement>} */
          const statements = []

          if (
            defaults.length > 0 ||
            actual.length > 0 ||
            scope.idToInvalidComponentName.size > 0
          ) {
            if (providerImportSource) {
              importProvider = true
              parameters.push({
                type: 'CallExpression',
                callee: {type: 'Identifier', name: '_provideComponents'},
                arguments: [],
                optional: false
              })
            }

            // Accept `components` as a prop if this is the `MDXContent` or
            // `_createMdxContent` function.
            if (
              isNamedFunction(scope.node, 'MDXContent') ||
              isNamedFunction(scope.node, '_createMdxContent')
            ) {
              parameters.push(toIdOrMemberExpression(['props', 'components']))
            }

            if (defaults.length > 0 || parameters.length > 1) {
              parameters.unshift({
                type: 'ObjectExpression',
                properties: defaults
              })
            }

            // If we’re getting components from several sources, merge them.
            /** @type {Expression} */
            let componentsInit =
              parameters.length > 1
                ? {
                    type: 'CallExpression',
                    callee: toIdOrMemberExpression(['Object', 'assign']),
                    arguments: parameters,
                    optional: false
                  }
                : parameters[0].type === 'MemberExpression'
                ? // If we’re only getting components from `props.components`,
                  // make sure it’s defined.
                  {
                    type: 'LogicalExpression',
                    operator: '||',
                    left: parameters[0],
                    right: {type: 'ObjectExpression', properties: []}
                  }
                : parameters[0]

            /** @type {ObjectPattern|undefined} */
            let componentsPattern

            // Add components to scope.
            // For `['MyComponent', 'MDXLayout']` this generates:
            // ```js
            // const {MyComponent, wrapper: MDXLayout} = _components
            // ```
            // Note that MDXLayout is special as it’s taken from
            // `_components.wrapper`.
            if (actual.length > 0) {
              componentsPattern = {
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
              }
            }

            if (scope.tags.length > 0) {
              declarations.push({
                type: 'VariableDeclarator',
                id: {type: 'Identifier', name: '_components'},
                init: componentsInit
              })
              componentsInit = {type: 'Identifier', name: '_components'}
            }

            if (isNamedFunction(scope.node, '_createMdxContent')) {
              for (const [
                id,
                componentName
              ] of scope.idToInvalidComponentName) {
                // For JSX IDs that can’t be represented as JavaScript IDs (as in,
                // those with dashes, such as `custom-element`), generate a
                // separate variable that is a valid JS ID (such as `_component0`),
                // and takes it from components:
                // `const _component0 = _components['custom-element']`
                declarations.push({
                  type: 'VariableDeclarator',
                  id: {type: 'Identifier', name: componentName},
                  init: {
                    type: 'MemberExpression',
                    object: {type: 'Identifier', name: '_components'},
                    property: {type: 'Literal', value: id},
                    computed: true,
                    optional: false
                  }
                })
              }
            }

            if (componentsPattern) {
              declarations.push({
                type: 'VariableDeclarator',
                id: componentsPattern,
                init: componentsInit
              })
            }

            if (declarations.length > 0) {
              statements.push({
                type: 'VariableDeclaration',
                kind: 'const',
                declarations
              })
            }
          }

          /** @type {string} */
          let key

          // Add partials (so for `x.y.z` it’d generate `x` and `x.y` too).
          for (key in scope.references) {
            if (own.call(scope.references, key)) {
              const parts = key.split('.')
              let index = 0
              while (++index < parts.length) {
                const partial = parts.slice(0, index).join('.')
                if (!own.call(scope.references, partial)) {
                  scope.references[partial] = {
                    node: scope.references[key].node,
                    component: false
                  }
                }
              }
            }
          }

          const references = Object.keys(scope.references).sort()
          let index = -1
          while (++index < references.length) {
            const id = references[index]
            const info = scope.references[id]
            const place = stringifyPosition(positionFromEstree(info.node))
            /** @type {Array<Expression>} */
            const parameters = [
              {type: 'Literal', value: id},
              {type: 'Literal', value: info.component}
            ]

            createErrorHelper = true

            if (development && place !== '1:1-1:1') {
              parameters.push({type: 'Literal', value: place})
            }

            statements.push({
              type: 'IfStatement',
              test: {
                type: 'UnaryExpression',
                operator: '!',
                prefix: true,
                argument: toIdOrMemberExpression(id.split('.'))
              },
              consequent: {
                type: 'ExpressionStatement',
                expression: {
                  type: 'CallExpression',
                  callee: {type: 'Identifier', name: '_missingMdxReference'},
                  arguments: parameters,
                  optional: false
                }
              },
              alternate: null
            })
          }

          if (statements.length > 0) {
            // Arrow functions with an implied return:
            if (fn.body.type !== 'BlockStatement') {
              fn.body = {
                type: 'BlockStatement',
                body: [{type: 'ReturnStatement', argument: fn.body}]
              }
            }

            fn.body.body.unshift(...statements)
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

    // If potentially missing components are used.
    if (createErrorHelper) {
      /** @type {Array<Expression>} */
      const message = [
        {type: 'Literal', value: 'Expected '},
        {
          type: 'ConditionalExpression',
          test: {type: 'Identifier', name: 'component'},
          consequent: {type: 'Literal', value: 'component'},
          alternate: {type: 'Literal', value: 'object'}
        },
        {type: 'Literal', value: ' `'},
        {type: 'Identifier', name: 'id'},
        {
          type: 'Literal',
          value:
            '` to be defined: you likely forgot to import, pass, or provide it.'
        }
      ]

      /** @type {Array<Identifier>} */
      const parameters = [
        {type: 'Identifier', name: 'id'},
        {type: 'Identifier', name: 'component'}
      ]

      if (development) {
        message.push({
          type: 'ConditionalExpression',
          test: {type: 'Identifier', name: 'place'},
          consequent: toBinaryAddition([
            {type: 'Literal', value: '\nIt’s referenced in your code at `'},
            {type: 'Identifier', name: 'place'},
            {
              type: 'Literal',
              value: (file.path ? '` in `' + file.path : '') + '`'
            }
          ]),
          alternate: {type: 'Literal', value: ''}
        })

        parameters.push({type: 'Identifier', name: 'place'})
      }

      tree.body.push({
        type: 'FunctionDeclaration',
        id: {type: 'Identifier', name: '_missingMdxReference'},
        generator: false,
        async: false,
        params: parameters,
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ThrowStatement',
              argument: {
                type: 'NewExpression',
                callee: {type: 'Identifier', name: 'Error'},
                arguments: [toBinaryAddition(message)]
              }
            }
          ]
        }
      })
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
        declarations: specifiersToDeclarations(
          specifiers,
          toIdOrMemberExpression(['arguments', 0])
        )
      }
    : {
        type: 'ImportDeclaration',
        specifiers,
        source: {type: 'Literal', value: providerImportSource}
      }
}

/**
 * @param {ESFunction} node
 * @param {string} name
 * @returns {boolean}
 */
function isNamedFunction(node, name) {
  return Boolean(node && 'id' in node && node.id && node.id.name === name)
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
