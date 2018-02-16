const fs = require('fs')
const test = require('ava')
const { createElement } = require('react')

const mdx = require('./')

const fixture = fs.readFileSync('fixture.md', 'utf8')

test('it parses and renders to react', t => {
  const components = {
    Foo: props => createElement('div', props),
    Bar: props => createElement('span', props)
  }

  const result = mdx(fixture, {
    components
  })

  t.snapshot(result)
})
