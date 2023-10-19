/**
 * @typedef {import('mdx/types.js').MDXComponents} Components
 * @typedef {import('react').ReactNode} ReactNode
 */

/**
 * @callback MergeComponents
 *   Custom merge function.
 * @param {Readonly<Components>} currentComponents
 *   Current components from the context.
 * @returns {Components}
 *   Merged components.
 *
 * @typedef Props
 *   Configuration.
 * @property {Readonly<Components> | MergeComponents | null | undefined} [components]
 *   Mapping of names for JSX components to React components (optional).
 * @property {boolean | null | undefined} [disableParentContext=false]
 *   Turn off outer component context (default: `false`).
 * @property {ReactNode | null | undefined} [children]
 *   Children (optional).
 */

import React from 'react'

const MDXContext = React.createContext({})

/**
 * Get current components from the MDX Context.
 *
 * @param {Readonly<Components> | MergeComponents | null | undefined} [components]
 *   Additional components to use or a function that takes the current
 *   components and filters/merges/changes them (optional).
 * @returns {Components}
 *   Current components.
 */
export function useMDXComponents(components) {
  const contextComponents = React.useContext(MDXContext)

  // Memoize to avoid unnecessary top-level context changes
  return React.useMemo(
    function () {
      // Custom merge via a function prop
      if (typeof components === 'function') {
        return components(contextComponents)
      }

      return {...contextComponents, ...components}
    },
    [contextComponents, components]
  )
}

/** @type {Readonly<Components>} */
const emptyObject = {}

/**
 * Provider for MDX context
 *
 * @param {Readonly<Props>} props
 *   Props.
 * @returns {JSX.Element}
 *   Element.
 */
export function MDXProvider({children, components, disableParentContext}) {
  /** @type {Readonly<Components>} */
  let allComponents

  if (disableParentContext) {
    allComponents =
      typeof components === 'function'
        ? components({})
        : components || emptyObject
  } else {
    allComponents = useMDXComponents(components)
  }

  return React.createElement(
    MDXContext.Provider,
    {value: allComponents},
    children
  )
}
