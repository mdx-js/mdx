/**
 * @import {MDXComponents} from 'mdx/types.js'
 * @import {Component, ComponentChildren, VNode} from 'preact'
 */

/**
 * @callback MergeComponents
 *   Custom merge function.
 * @param {Readonly<MDXComponents>} currentComponents
 *   Current components from the context.
 * @returns {MDXComponents}
 *   Additional components.
 *
 * @typedef Props
 *   Configuration for `MDXProvider`.
 * @property {ComponentChildren} [children]
 *   Children (optional).
 * @property {Readonly<MDXComponents> | MergeComponents | null | undefined} [components]
 *   Additional components to use or a function that creates them (optional).
 * @property {boolean | null | undefined} [disableParentContext=false]
 *   Turn off outer component context (default: `false`).
 */

import {createContext, h} from 'preact'
import {useContext} from 'preact/hooks'

/** @type {Readonly<MDXComponents>} */
const emptyComponents = {}

const MDXContext = createContext(emptyComponents)

/**
 * Get current components from the MDX Context.
 *
 * @param {Readonly<MDXComponents> | MergeComponents | null | undefined} [components]
 *   Additional components to use or a function that creates them (optional).
 * @returns {MDXComponents}
 *   Current components.
 */
export function useMDXComponents(components) {
  const contextComponents = useContext(MDXContext)

  // Custom merge via a function prop
  if (typeof components === 'function') {
    return components(contextComponents)
  }

  return {...contextComponents, ...components}
}

/**
 * Provider for MDX context.
 *
 * @param {Readonly<Props>} properties
 *   Properties.
 * @returns {VNode}
 *   Element.
 * @satisfies {Component}
 */
export function MDXProvider(properties) {
  /** @type {Readonly<MDXComponents>} */
  let allComponents

  if (properties.disableParentContext) {
    allComponents =
      typeof properties.components === 'function'
        ? properties.components(emptyComponents)
        : properties.components || emptyComponents
  } else {
    allComponents = useMDXComponents(properties.components)
  }

  return h(
    MDXContext.Provider,
    {children: undefined, value: allComponents},
    properties.children
  )
}
