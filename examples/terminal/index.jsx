import React from 'react'
import {render, Box, Text} from 'ink'
import MDX from '@mdx-js/runtime'

const content = `
# Hello, world!

From <Text backgroundColor="black" color="white" bold>MDX!</Text>

<Box marginTop={1}>
  <Text backgroundColor="cyan" color="white" bold>
    I'm a cyan box!
  </Text>
</Box>
`

render(
  <MDX
    components={{
      Box,
      Text,
      h1: ({children}) => (
        <Text underline bold>
          {children}
        </Text>
      ),
      p: ({children}) => <Text>{children}</Text>
    }}
  >
    {content}
  </MDX>
)
