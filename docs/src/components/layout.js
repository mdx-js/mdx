import React, {useState, useEffect} from 'react'
import {navigate} from 'gatsby'
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
import baseTheme from './theme'

const loadJs = () => import('./docsearch.min.js')

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
  <Banner>
    <Link
      href="https://v0.mdxjs.com"
      css={css({
        color: 'inherit',
        textDecoration: 'none'
      })}
    >
      <span role="img" aria-label="Confetti emoji">
        🎉
      </span>
      These docs are for v1 (currently in beta)
    </Link>{' '}
    &mdash;{' '}
    <Link
      href="https://v0.mdxjs.com"
      css={css({
        color: 'inherit',
        textTransform: 'uppercase',
        textDecoration: 'none'
      })}
    >
      read the v0 docs &rarr;
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

  // Copied from Gatsby (MIT License)
  // https://github.com/gatsbyjs/gatsby/blob/30070ec9a9e678ab8f23adda952510938c09bfcb/www/src/components/search-form.js
  useEffect(() => {
    const initDocsearch = async () => {
      const docsearch = await loadJs()

      window.docsearch = docsearch.default
      window.docsearch({
        apiKey: 'a8077c5e74b2e215c450cffa97d15c9d',
        indexName: 'mdxjs',
        inputSelector: '.docsearch-input',
        debug: false,
        autocompleteOptions: {
          openOnFocus: true,
          autoselect: true,
          hint: false,
          keyboardShortcuts: ['s']
        }
      })

      const path = 'https://unpkg.com/docsearch.js@2.6.2/dist/cdn/docsearch.min.css'
      const link = document.createElement('link')
      link.setAttribute('rel', 'stylesheet')
      link.setAttribute('type', 'text/css')
      link.setAttribute('href', path)
      document.head.appendChild(link)
    }

    initDocsearch()

    const autocompleteSelected = e => {
      e.stopPropagation()
      const a = document.createElement(`a`)
      a.href = e._args[0].url
      const paths = a.pathname.split(`/`).filter(el => el !== ``)
      const slug = paths[paths.length - 1]
      const path = `#${slug}` === a.hash ? `${a.pathname}` : `${a.pathname}${a.hash}`
      navigate(path)
    }


    window.addEventListener(
      'autocomplete:selected',
      autocompleteSelected,
      true
    )

    return () => {
      window.removeEventListener(
        'autocomplete:selected',
        autocompleteSelected,
        true
      )
    }
  }, [])

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
