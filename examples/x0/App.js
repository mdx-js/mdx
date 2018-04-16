import React from 'react'
import Markdown from './Markdown'

const components = {
  h1: props => <h1 style={{ color: 'tomato' }} {...props} />
}

const scope = {
  name: 'world!',
  Box: props => <div style={{ border: 'thin solid tomato' }} {...props} />
}

const mdx = `
# Hello, {name}

<Box>
  <h4>!!!!!</h4>
</Box>
`

export default () => (
  <Markdown components={components} children={mdx} {...scope} />
)
