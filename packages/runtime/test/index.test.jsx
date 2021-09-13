/* @jsx React.createElement */
/* @jsxFrag React.Fragment */
import {test} from 'uvu'
import assert from 'uvu/assert'
import React from '../../react/node_modules/react'
import {renderToString} from '../../react/node_modules/react-dom/server'
import slug from 'remark-slug'
import autolinkHeadings from 'remark-autolink-headings'
import addClasses from 'rehype-add-classes'

import MDX from '../src'

test('should work', () => {
  assert.equal(renderToString(<MDX># Hi!</MDX>), '<h1>Hi!</h1>')
})

test('should support `components`', () => {
  assert.equal(
    renderToString(
      <MDX
        components={{
          h1(props) {
            return <h1 style={{color: 'tomato'}} {...props} />
          },
          Foo() {
            return <div>Foobarbaz</div>
          }
        }}
      >
        {'# Hello, world\n\n<Foo />'}
      </MDX>
    ),
    '<h1 style="color:tomato">Hello, world</h1><div>Foobarbaz</div>'
  )
})

test('should support `scope`', () => {
  assert.equal(
    renderToString(<MDX scope={{some: 'value'}}>{'# {some}'}</MDX>),
    '<h1>value</h1>'
  )
})

test('should support a custom layout in the content', () => {
  assert.equal(
    renderToString(
      <MDX id="layout">
        {
          '# hi\nexport default ({children, id}) => <div id={id}>{children}</div>'
        }
      </MDX>
    ),
    '<div id="layout"><h1>hi</h1></div>'
  )
})

test('should supports remark and rehype plugins', () => {
  assert.equal(
    renderToString(
      <MDX
        remarkPlugins={[slug, autolinkHeadings]}
        rehypePlugins={[[addClasses, {h1: 'title'}]]}
      >
        # hi
      </MDX>
    ),
    '<h1 id="hi" class="title"><a href="#hi" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>hi</h1>'
  )
})

test('should crash if non-syntactical MDX is used', async () => {
  assert.throws(() => {
    renderToString(<MDX>{'<//>'}</MDX>)
  }, 'Unexpected character `/` (U+002F) before name, expected a character that can start a name')
})

test('should crash if non-syntactical JSX in JS is used', async () => {
  assert.throws(() => {
    renderToString(<MDX>{'{<//>}'}</MDX>)
  }, 'Could not parse expression with acorn: Unexpected token')
})

test('should crash if non-syntactical JS is used', async () => {
  assert.throws(() => {
    renderToString(<MDX>{'{1..2}'}</MDX>)
  }, 'Unexpected content after expression')
})

test('should crash if JS can’t be evaluated', async () => {
  assert.throws(() => {
    renderToString(<MDX>{'{undefined()}'}</MDX>)
  }, 'undefined is not a function')
})

test.run()
