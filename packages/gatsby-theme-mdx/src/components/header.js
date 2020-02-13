import React from 'react'
import {Link} from 'gatsby'
import {css} from 'theme-ui'
import pkg from '@mdx-js/mdx/package.json'
import Burger from './burger'
import theme from './theme'
import DarkToggle from './dark-toggle'
import Search from './search'
import {GithubButton, TwitterButton} from './buttons'

const MenuButton = props => (
  <button
    title="Toggle Menu"
    {...props}
    css={css({
      appearance: 'none',
      border: 0,
      color: 'inherit',
      p: 2,
      bg: 'transparent',
      borderRadius: 4,
      '&:focus': {
        outline: '1px solid'
      },
      [theme.mediaQueries.big]: {
        display: 'none'
      }
    })}
  >
    <Burger />
  </button>
)

export default ({toggleMenu, dark, setDark}) => (
  <header
    css={css({
      display: 'flex',
      alignItems: 'center',
      fontSize: 14
    })}
  >
    <Link
      to="/"
      css={css({
        display: 'flex',
        alignItems: 'center',
        p: 3,
        color: 'inherit',
        fontWeight: 'bold',
        textDecoration: 'none'
      })}
    >
      <img
        src="https://mdx-logo.now.sh"
        alt="MDX logo"
        height="32"
        css={css({
          mr: 3
        })}
      />
    </Link>
    <Search />
    <div css={{margin: 'auto'}} />
    <span
      css={{
        display: 'none',
        [theme.mediaQueries.big]: {
          display: 'inline',
          padding: '8px'
        }
      }}
    >
      v{pkg.version}
    </span>
    <GithubButton dark={dark} />
    <TwitterButton
      dark={dark}
      customCss={{
        display: 'none',
        [theme.mediaQueries.big]: {
          display: 'flex'
        }
      }}
    />
    <DarkToggle dark={dark} setDark={setDark} />
    <MenuButton
      onClick={toggleMenu}
      css={css({
        mr: 2
      })}
    />
  </header>
)
