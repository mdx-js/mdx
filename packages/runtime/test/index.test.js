import React from 'react'
import {renderToString} from 'react-dom/server'
import slug from 'remark-slug'
import autolinkHeadings from 'remark-autolink-headings'
import addClasses from 'rehype-add-classes'

import MDX from '../src'

describe('@mdx-js/runtime', () => {
  it('should work', () => {
    expect(renderToString(<MDX># Hi!</MDX>)).toEqual('<h1>Hi!</h1>')
  })

  it('should support `components`', () => {
    expect(
      renderToString(
        <MDX
          components={{
            h1: props => <h1 style={{color: 'tomato'}} {...props} />,
            Foo: () => <div>Foobarbaz</div>
          }}
          children={'# Hello, world\n\n<Foo />'}
        />
      )
    ).toEqual('<h1 style="color:tomato">Hello, world</h1><div>Foobarbaz</div>')
  })

  it('should support `scope`', () => {
    expect(
      renderToString(<MDX scope={{some: 'value'}} children={'# {some}'} />)
    ).toEqual('<h1>value</h1>')
  })

  it('should support a custom layout in the content', () => {
    expect(
      renderToString(
        <MDX
          id="layout"
          children={
            '# hi\nexport default ({children, id}) => <div id={id}>{children}</div>'
          }
        />
      )
    ).toEqual('<div id="layout"><h1>hi</h1></div>')
  })

  it('should supports remark and rehype plugins', () => {
    expect(
      renderToString(
        <MDX
          remarkPlugins={[slug, autolinkHeadings]}
          rehypePlugins={[[addClasses, {h1: 'title'}]]}
        >
          # hi
        </MDX>
      )
    ).toEqual(
      '<h1 id="hi" class="title"><a href="#hi" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>hi</h1>'
    )
  })

  it('should crash if non-syntactical MDX is used', async () => {
    expect(() => {
      renderToString(<MDX children={'<//>'} />)
    }).toThrow(
      'Unexpected character `/` (U+002F) before name, expected a character that can start a name'
    )
  })

  it('should crash if non-syntactical JSX in JS is used', async () => {
    expect(() => {
      renderToString(<MDX children={'{<//>}'} />)
    }).toThrow(
      'Could not parse expression with acorn: SyntaxError: Unexpected token'
    )
  })

  it('should crash if non-syntactical JS is used', async () => {
    expect(() => {
      renderToString(<MDX children={'{1..2}'} />)
    }).toThrow('Unexpected content after expression')
  })

  it('should crash if JS can’t be evaluated', async () => {
    expect(() => {
      renderToString(<MDX children={'{undefined()}'} />)
    }).toThrow('undefined is not a function')
  })
})
