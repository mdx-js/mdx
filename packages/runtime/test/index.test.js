import React from 'react'
import {renderToString as render} from 'react-dom/server'
import slug from 'remark-slug'
import autolinkHeadings from 'remark-autolink-headings'
import addClasses from 'rehype-add-classes'

import MDX from '../src'

const components = {
  h1: props => <h1 style={{color: 'tomato'}} {...props} />
}

const scope = {
  Foo: () => <div>Foobarbaz</div>
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
      <MDX components={{...components, ...scope}} children={mdx} />
    )

    expect(result).toMatch(/style="color:tomato"/)
    expect(result).toMatch(/Foobarbaz/)
  })

  it('custom layout', () => {
    const result = render(
      <MDX
        components={{...components, ...scope}}
        children={mdxLayout}
        id="layout"
      />
    )

    expect(result).toMatch(/style="color:tomato"/)
    expect(result).toMatch(/Foobarbaz/)
    expect(result).toMatch(/id="layout"/)
  })
})

it('supports remark and rehype plugins', () => {
  const result = render(
    <MDX
      remarkPlugins={[slug, autolinkHeadings]}
      rehypePlugins={[[addClasses, {h1: 'title'}]]}
      components={components}
      scope={scope}
      children={mdx}
    />
  )

  expect(result).toContain(`id="hello-world"`)
  expect(result).toContain('class="title"')
})
