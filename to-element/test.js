const React = require('react')
const test = require('ava')

const toElement = require('./')

test('creates element from a string', t => {
  const result = toElement(`<div>
    <h1>Hello</h1>
  </div>`)

  t.is(typeof result, 'object')
  t.is(result.type, 'div')
  t.is(result.props.children.type, 'h1')
})

test('creates an element with scoped components', t => {
  const Box = props => React.createElement('div', props)

  const result = toElement(`<Box>
    <h1>Hello</h1>
  </Box>`, { Box })

  t.is(typeof result, 'object')
  t.is(result.type, Box)
  t.is(result.props.children.type, 'h1')
})

test('throws with bad jsx', t => {
  t.throws(() => {
    toElement('<div /')
  })
})
