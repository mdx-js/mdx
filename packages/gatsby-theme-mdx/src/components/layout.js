import React, {useState, useEffect} from 'react'
import {Global} from '@emotion/core'
import {ComponentProvider} from 'emotion-mdx'
import css from '@styled-system/css'

import components from './mdx-components'
import SidebarContent from './sidebar.mdx'
import Header from './header'
import Pagination from './pagination'
import EditLink from './edit-link'
import Link from './link'
import Banner from './banner'
import {SkipNavLink, SkipNavContent} from './skip-nav'
import baseTheme from './theme'

const styles = (
  <Global
    styles={css({
      '*': {boxSizing: 'border-box'},
      body: {
        m: 0,
        fontFamily: 'system-ui, sans-serif',
        lineHeight: 1.5,
        color: 'text',
        bg: 'background',
        transitionProperty: 'background-color',
        transitionTimingFunction: 'ease-out',
        transitionDuration: '.4s'
      }
    })}
  />
)

const V0Banner = () => (
  <Banner
    css={{
      display: 'flex',
      justifyContent: 'space-between'
    }}
  >
    <Link
      href="/blog/v1"
      css={css({
        color: 'inherit',
        textDecoration: 'none'
      })}
    >
      <span role="img" aria-label="Confetti emoji">
        🎉
      </span>
      Launching MDX v1 {' '} &rarr;
    </Link>{' '}
    {' '}
    <Link
      href="https://v0.mdxjs.com"
      css={css({
        color: 'inherit',
        textTransform: 'uppercase',
        textDecoration: 'none'
      })}
    >
      v0 docs
    </Link>
  </Banner>
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

const Sidebar = ({open, ...props}) => (
  <ComponentProvider
    theme={{
      styles: {
        ul: {
          listStyle: 'none',
          pl: 16
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
      }
    }}
  >
    <div
      {...props}
      css={css({
        display: open ? 'block' : 'none',
        position: 'relative',
        maxHeight: '100vh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        bg: 'background',
        transition: 'background-color .4s ease-out',
        pb: 4,
        [baseTheme.mediaQueries.big]: {
          display: 'block',
          width: 256,
          minWidth: 0,
          flex: 'none',
          position: 'sticky',
          top: 0
        }
      })}
    />
  </ComponentProvider>
)

const Overlay = props =>
  props.open && (
    <div
      {...props}
      css={css({
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const initialDark = window.localStorage.getItem('dark') === 'true'
    if (initialDark !== dark) {
      setDark(initialDark)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('dark', dark)
  }, [dark])

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }
  const closeMenu = () => {
    setMenuOpen(false)
  }
  const theme = {
    ...baseTheme,
    dark,
    colors: dark ? baseTheme.colors.dark : baseTheme.colors,
    prism: dark ? baseTheme.prism.dark : baseTheme.prism
  }

  return (
    <>
      <ComponentProvider theme={theme} transform={css} components={components}>
        <SkipNavLink />
        {styles}
        <V0Banner />
        <Root>
          <Overlay open={menuOpen} onClick={closeMenu} />
          <Header toggleMenu={toggleMenu} dark={dark} setDark={setDark} />
          <Main>
            <Sidebar onClick={closeMenu} open={menuOpen}>
              <SidebarContent />
            </Sidebar>
            <Container className="searchable-content">
              <SkipNavContent />
              {props.children}
              <EditLink />
              <Pagination />
            </Container>
          </Main>
        </Root>
      </ComponentProvider>
    </>
  )
}
