/** @jsx jsx */
import React from 'react'
import {Global} from '@emotion/core'
import {ThemeProvider, css, jsx} from 'theme-ui'

import Head from './head'
import baseComponents from './mdx-components'
import baseTheme from './theme'

const codeTreatment = {
  '&:before': {
    content: '"<"',
    display: 'block'
  },
  '&:after': {
    content: '"/>"',
    display: 'block',
    ml: 2
  },
  [['&:after', '&:before']]: {
    color: 'tomato',
    background: 'linear-gradient(64deg, #F19A38 1%, #F79E06 99%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  }
}

const Speaker = props => {
  const children = React.Children.toArray(props.children)
  const name = children[0]
  children[0] = children[1]
  children[1] = name

  return (
    <section
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: ['100%', '50%', '24%'],
        ml: '1%',
        p: {
          fontSize: [1, 2]
        },
        h3: {
          m: 0,
          mt: -2,
          lineHeight: 1,
          fontSize: [2, 3],
          a: {
            color: 'text',
            '&:visited': {
              color: 'text'
            },
            '&:hover': {
              color: '#794AD9'
            }
          }
        },
        h4: {
          mt: 3,
          mb: -2,
          lineHeight: 1,
          fontFamily: 'monospace',
          fontSize: [1, 2],
          color: 'muted'
        },
        img: {
          maxWidth: '100%'
        }
      }}
      {...props}
      children={children}
    />
  )
}

const SpeakerList = props => {
  return (
    <div
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        ml: '-1%'
      }}
      {...props}
    />
  )
}

const confComponents = {
  h1: props => (
    <h1
      sx={{
        display: 'flex',
        ml: [0, 0, -64],
        alignItems: 'center',
        ...codeTreatment
      }}
      {...props}
    />
  ),
  h2: props => (
    <h2
      sx={{
        display: 'flex',
        alignItems: 'center',
        ml: [0, 0, -20],
        ...codeTreatment
      }}
      {...props}
    />
  ),
  h3: props => (
    <h3
      sx={{
        display: 'flex',
        alignItems: 'center'
      }}
      {...props}
    />
  ),
  SpeakerList,
  Speaker
}

const confTheme = {
  styles: {
    h1: {
      fontSize: [60, 80, 100],
      fontFamily: 'monospace',
      mb: 0,
      lineHeight: 1
    },
    h2: {
      mt: 5,
      mb: -2,
      fontFamily: 'monospace'
    },
    h3: {
      fontFamily: 'monospace',
      mb: -2
    },
    p: {
      maxWidth: ['100%', '32em'],
      fontSize: [2, 3, 4]
    },
    a: {
      color: '#794AD9', // '#BF1CDA',
      fontWeight: 600,
      '&:hover': {
        color: '#794AD9'
      },
      '&:visited': {
        color: '#794AD9'
      }
    }
  }
}

const styles = (
  <Global
    styles={css({
      '*': {boxSizing: 'border-box'},
      body: {
        m: 0,
        fontFamily: 'system-ui, sans-serif',
        lineHeight: 1.5
      }
    })}
  />
)

const Root = props => (
  <div
    {...props}
    css={css({
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    })}
  />
)

const Main = props => (
  <main
    {...props}
    css={css({
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      flex: '1 1 auto',
      [baseTheme.mediaQueries.big]: {
        flexDirection: 'row'
      }
    })}
  />
)

const Container = props => (
  <div
    {...props}
    css={css({
      minWidth: 0,
      width: '100%',
      maxWidth: 1024,
      mx: 'auto',
      p: 4
    })}
  />
)

export default props => {
  const theme = {
    ...baseTheme,
    ...confTheme,
    styles: {
      ...baseTheme.styles,
      ...confTheme.styles
    }
  }
  const components = {
    ...baseComponents,
    ...confComponents
  }

  const { title, description } = props._frontmatter

  return (
    <>
      <ThemeProvider theme={theme} components={components}>
        {styles}
        <Root>
          <Head title={title} description={description} skipBreadcrumb={true} />
          <Main>
            <Container className="searchable-content">
              {props.children}
            </Container>
          </Main>
        </Root>
      </ThemeProvider>
    </>
  )
}
