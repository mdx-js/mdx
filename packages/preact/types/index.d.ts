// TypeScript Version: 3.4

import {h, Context, AnyComponent, Fragment, FunctionComponent} from 'preact'

/**
 * Mapping of names for JSX components to React components
 */
interface ComponentDictionary {
  [name: string]: AnyComponent<any>
}

/**
 * Prop type that includes a component dictionary
 */
interface ComponentsProp {
  /**
   * Mapping of names for JSX components to React components
   */
  components?: ComponentDictionary
  /**
   * Turn off outer component context
   *
   * @defaultValue false
   */
  disableParentContext?: boolean
}

/**
 * Direct access to the MDX React Context
 */
declare const MDXContext: Context<ComponentsProp>

/**
 * Provider for MDX context
 */
declare const MDXProvider: FunctionComponent<ComponentsProp>

/**
 * Gets components from the MDX Context
 *
 * @param components additional components to include
 * @returns all components from context with overrides from components parameter
 */
declare function useMDXComponents(
  components: ComponentDictionary | (() => ComponentDictionary)
): ComponentDictionary

/**
 * High order component that passes components prop to child
 *
 * @param child Component being wrapped
 */
declare function withMDXComponents(
  child: AnyComponent<ComponentsProp>
): ReactElement | null

/**
 * Preact hyperscript function wrapped with handler for MDX content
 */
declare const mdx: typeof h & {
  Fragment: typeof Fragment
}

export {
  ComponentDictionary,
  ComponentsProp,
  MDXContext,
  MDXProvider,
  useMDXComponents,
  withMDXComponents,
  mdx
}
