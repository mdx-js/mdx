import React from 'react'
import { renderToString as render } from 'react-dom/server'
import { MDXProvider } from '@mdx-js/tag'

import MDX from '../src'

const components = {
  h1: props => <h1 style={{ color: 'tomato'}} {...props} />
}

const scope = {
  Foo: props => <div>Foobarbaz</div>
}

const mdx = `
# Hello, world

<Foo />
`

it('renders MDX with the proper components', () => {
  const result = render(
    <MDX
      components={components}
      scope={scope}
      children={mdx}
    />
  )

  expect(result).toMatch(/style="color:tomato"/)
  expect(result).toMatch(/Foobarbaz/)
})
