import React from 'react'
import { renderToString as render } from 'react-dom/server'
import { MDXProvider } from '@mdx-js/tag'

import MDX from '../src'

const components = {
  h1: props => <h1 style={{ color: 'tomato' }} {...props} />
}

const scope = {
  Foo: props => <div>Foobarbaz</div>
}

const mdx = `
# Hello, world

<Foo />
`

const mdxLayout = `
# Hello, world

<Foo />

export default ({ children, id }) => <div id={id}>{children}</div>
`

describe('renders MDX with the proper components', () => {
  it('default layout', () => {
    const result = render(
      <MDX components={components} scope={scope} children={mdx} />
    )

    expect(result).toMatch(/style="color:tomato"/)
    expect(result).toMatch(/Foobarbaz/)
  })

  it('custom layout', () => {
    const result = render(
      <MDX
        components={components}
        scope={scope}
        children={mdxLayout}
        id="layout"
      />
    )

    expect(result).toMatch(/style="color:tomato"/)
    expect(result).toMatch(/Foobarbaz/)
    expect(result).toMatch(/id="layout"/)
  })
})
