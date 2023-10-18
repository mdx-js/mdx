/**
 * @typedef {import('mdx/types.js').MDXComponents} Components
 * @typedef {import('preact').ComponentChildren} ComponentChildren
 * @typedef {import('preact').Context<Components>} Context
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
 *   Mapping of names for JSX components to Preact components (optional).
 * @property {boolean | null | undefined} [disableParentContext=false]
 *   Turn off outer component context (default: `false`).
 * @property {ComponentChildren | null | undefined} [children]
 *   Children (optional).
 */

import {createContext, h} from 'preact'
import {useContext} from 'preact/hooks'

/**
 * @type {Context}
 *   Context.
 * @deprecated
 *   This export is marked as a legacy feature.
 *   That means it’s no longer recommended for use as it might be removed
 *   in a future major release.
 *
 *   Please use `useMDXComponents` to get context based components and
 *   `MDXProvider` to set context based components instead.
 */
export const MDXContext = createContext({})

/**
 * @param {import('preact').ComponentType<any>} Component
 *   Component.
 * @deprecated
 *   This export is marked as a legacy feature.
 *   That means it’s no longer recommended for use as it might be removed
 *   in a future major release.
 *
 *   Please use `useMDXComponents` to get context based components instead.
 * @returns
 *   Bound component.
 */
export function withMDXComponents(Component) {
  return boundMDXComponent

  /**
   * @param {Record<string, unknown> & {components?: Components | null | undefined}} props
   *   Props.
   * @returns {JSX.Element}
   *   Element.
   */
  function boundMDXComponent(props) {
    const allComponents = useMDXComponents(props.components)
    return h(Component, {...props, allComponents})
  }
}

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
  const contextComponents = useContext(MDXContext)

  // Custom merge via a function prop
  if (typeof components === 'function') {
    return components(contextComponents)
  }

  return {...contextComponents, ...components}
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

  return h(
    MDXContext.Provider,
    {children: undefined, value: allComponents},
    children
  )
}
