import React from 'react'
import {Global} from '@emotion/core'
import {ComponentProvider} from 'emotion-mdx'
import css from '@styled-system/css'
import Head from './head'
import components from './mdx-components'
import HeaderContent from './header.mdx'
import SidebarContent from './sidebar.mdx'
import Pagination from './pagination'
import theme from './theme'

const styles = (
  <Global
    styles={{
      '*': {boxSizing: 'border-box'},
      body: {
        margin: 0,
        fontFamily: 'system-ui, sans-serif',
        lineHeight: 1.5,
        color: '#000',
        backgroundColor: '#fff'
      }
    }}
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

const Header = props => (
  <header
    {...props}
    css={css({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 3,
      bg: 'gray',
      img: {
        display: 'inline-block',
        verticalAlign: 'middle'
      },
      a: {
        color: 'inherit',
        textDecoration: 'none',
        fontWeight: 'bold'
      }
    })}
  />
)

const Sidebar = props => (
  <div
    {...props}
    css={css({
      width: 320,
      minWidth: 0,
      flex: 'none',
      position: 'sticky',
      bg: 'background',
      top: 0,
      maxHeight: '100vh',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      ul: {
        listStyle: 'none'
      },
      a: {
        display: 'block',
        color: 'inherit',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: 1,
        px: 2,
        py: 2,
        '&.active': {
          color: 'primary'
        }
      }
    })}
  />
)

const Main = props => (
  <main
    {...props}
    css={css({
      display: 'flex',
      minWidth: 0,
      flex: '1 1 auto'
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
  return (
    <>
      <Head />
      {styles}
      <ComponentProvider theme={theme} transform={css} components={components}>
        <Root>
          <Header>
            <HeaderContent />
          </Header>
          <Main>
            <Sidebar>
              <SidebarContent />
            </Sidebar>
            <Container>
              {props.children}
              <Pagination />
            </Container>
          </Main>
        </Root>
      </ComponentProvider>
    </>
  )
}
