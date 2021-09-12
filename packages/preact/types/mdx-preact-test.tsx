import {h, Fragment} from 'preact'
// tslint:disable-next-line: no-duplicate-imports
import type {ComponentChildren} from 'preact'
import {useContext} from 'preact/hooks'
import {
  MDXProvider,
  useMDXComponents,
  withMDXComponents,
  ComponentsProp,
  MDXContext,
  mdx
} from '@mdx-js/preact'

const H1 = ({children}: {children: ComponentChildren}) => <h1>{children}</h1>

const MDXProvideExample = () => (
  <MDXProvider components={{h1: H1}} disableParentContext={true}>
    <h1>Hello, world!</h1>
  </MDXProvider>
)

const WithMDXComponentsExample = () =>
  withMDXComponents(({components}: ComponentsProp) => {
    components // $ExpectType ComponentDictionary | undefined
    return <div />
  })

const UseMDXComponentsExample = () => {
  useMDXComponents({h1: H1}) // $ExpectType ComponentDictionary
  useMDXComponents(() => ({h1: H1})) // $ExpectType ComponentDictionary
}

const UseMDXContextExample = () => {
  const {components} = useContext(MDXContext)
  components // $ExpectType ComponentDictionary | undefined
}

const MDXCreateElementExample = () => mdx('mdx', {title: 'example'}, [])

mdx.Fragment === Fragment
