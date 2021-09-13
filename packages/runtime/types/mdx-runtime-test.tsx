import * as React from 'react'
import MDX from '@mdx-js/runtime'

const exampleNoProps = () => <MDX># header</MDX>

const exampleInvalidContent = () => (
  // $ExpectError
  <MDX>{<div />}</MDX>
)

const exampleScopeAndComponents = (mdx: string) => (
  <MDX
    components={{
      h1() {
        return <h1 />
      }
    }}
    scope={{value: 'example'}}
  >
    {mdx}
  </MDX>
)

const exampleFullConfig = (mdx: string) => (
  <MDX
    components={{
      h1() {
        return <h1 />
      }
    }}
    scope={{value: 'example', number: 1}}
    rehypePlugins={[() => () => ({type: 'test'})]}
    remarkPlugins={[() => () => ({type: 'test'})]}
  >
    {mdx}
  </MDX>
)
