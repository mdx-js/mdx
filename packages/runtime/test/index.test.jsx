/* @jsx React.createElement */
/* @jsxFrag React.Fragment */
const {test} = require('uvu')
const assert = require('uvu/assert')
import React from 'react'
import {renderToString} from 'react-dom/server'
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
          h1: props => <h1 style={{color: 'tomato'}} {...props} />,
          Foo: () => <div>Foobarbaz</div>
        }}
        children={'# Hello, world\n\n<Foo />'}
      />
    ),
    '<h1 style="color:tomato">Hello, world</h1><div>Foobarbaz</div>'
  )
})

test('should support `scope`', () => {
  assert.equal(
    renderToString(<MDX scope={{some: 'value'}} children={'# {some}'} />),
    '<h1>value</h1>'
  )
})

test('should support a custom layout in the content', () => {
  assert.equal(
    renderToString(
      <MDX
        id="layout"
        children={
          '# hi\nexport default ({children, id}) => <div id={id}>{children}</div>'
        }
      />
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
    renderToString(<MDX children={'<//>'} />)
  }, 'Unexpected character `/` (U+002F) before name, expected a character that can start a name')
})

test('should crash if non-syntactical JSX in JS is used', async () => {
  assert.throws(() => {
    renderToString(<MDX children={'{<//>}'} />)
  }, 'Could not parse expression with acorn: Unexpected token')
})

test('should crash if non-syntactical JS is used', async () => {
  assert.throws(() => {
    renderToString(<MDX children={'{1..2}'} />)
  }, 'Unexpected content after expression')
})

test('should crash if JS can’t be evaluated', async () => {
  assert.throws(() => {
    renderToString(<MDX children={'{undefined()}'} />)
  }, 'undefined is not a function')
})

test.run()
