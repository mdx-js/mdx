// TypeScript Version: 3.4

import {
  Context,
  Consumer,
  ComponentType,
  FunctionComponent,
  ReactElement,
  createElement
} from 'react'

interface ComponentDictionary {
  [name: string]: ComponentType<any>
}

interface ComponentsProp {
  components: ComponentDictionary
}

declare const MDXContext: Context<ComponentsProp>
declare const MDXProvider: FunctionComponent<ComponentsProp>
declare function useMDXComponents(
  components: ComponentDictionary | (() => ComponentDictionary)
): ComponentDictionary
declare function withMDXComponents(
  child: FunctionComponent<ComponentsProp>
): ReactElement | null
declare const mdx: typeof createElement

export {
  ComponentDictionary,
  ComponentsProp,
  MDXContext,
  MDXProvider,
  useMDXComponents,
  withMDXComponents,
  mdx
}
