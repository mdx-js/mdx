import React from 'react'
import {Global} from '@emotion/react'
import {ThemeProvider, css} from 'theme-ui'

import components from './mdx-components'
import baseTheme from './theme'

const styles = (
  <Global
    styles={css({
      '*': {boxSizing: 'border-box'},
      body: {
        m: 0,
        fontFamily: 'system-ui, sans-serif',
        lineHeight: 1.5,
        color: '#fff',
        bg: '#000',
        transitionProperty: 'background-color',
        transitionTimingFunction: 'ease-out',
        transitionDuration: '.4s'
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
  const theme = baseTheme
  theme.styles.a.color = '#fff'

  return (
    <>
      <ThemeProvider theme={theme} components={components}>
        {styles}
        <Root>
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
