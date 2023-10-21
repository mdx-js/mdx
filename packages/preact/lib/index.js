/**
 * @typedef {import('mdx/types.js').MDXComponents} MDXComponents
 * @typedef {import('preact').Component} Component
 * @typedef {import('preact').ComponentChildren} ComponentChildren
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
 * @property {ComponentChildren | null | undefined} [children]
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
 * @param {Readonly<Props>} props
 *   Props.
 * @returns {JSX.Element}
 *   Element.
 * @satisfies {Component}
 */
export function MDXProvider(props) {
  /** @type {Readonly<MDXComponents>} */
  let allComponents

  if (props.disableParentContext) {
    allComponents =
      typeof props.components === 'function'
        ? props.components(emptyComponents)
        : props.components || emptyComponents
  } else {
    allComponents = useMDXComponents(props.components)
  }

  return h(
    MDXContext.Provider,
    {children: undefined, value: allComponents},
    props.children
  )
}
