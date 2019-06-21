const React = require('react')
const {render, Color, Box, Text} = require('ink')
const MDX = require('@mdx-js/runtime')
const {MDXProvider} = require('@mdx-js/react')

const MDXContent = `
# Hello, world!

From <Color bgBlack white bold>    MDX!    </Color>

<Box marginTop={1}>
  <Color bgCyan white bold>
    I'm a cyan box!
  </Color>
</Box>
`

const components = {
  Box,
  Color,
  h1: ({children}) => (
    <Text underline bold>
      {children}
    </Text>
  ),
  p: ({children}) => <Text>{children}</Text>
}

render(
  <MDXProvider components={components}>
    <MDX>{MDXContent}</MDX>
  </MDXProvider>
)
