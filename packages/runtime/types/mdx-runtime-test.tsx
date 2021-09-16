import * as React from 'react'
import MDX from '@mdx-js/runtime'

const exampleNoProps = () => <MDX># header</MDX>

const exampleInvalidContent = () => (
  // $ExpectError
  <MDX>{<div />}</MDX>
)

// To do: support `components` in types again.
// components={{
//   h1() {
//     return <h1 />
//   }
// }}

const exampleScopeAndComponents = (mdx: string) => (
  <MDX scope={{value: 'example'}}>{mdx}</MDX>
)

// To do: support `components` in types again.
// components={{
//   h1() {
//     return <h1 />
//   }
// }}

const exampleFullConfig = (mdx: string) => (
  <MDX
    scope={{value: 'example', number: 1}}
    rehypePlugins={[() => () => ({type: 'test'})]}
    remarkPlugins={[() => () => ({type: 'test'})]}
  >
    {mdx}
  </MDX>
)
