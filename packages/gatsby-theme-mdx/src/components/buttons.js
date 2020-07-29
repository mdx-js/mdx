import React from 'react'
import {css} from 'theme-ui'
import {GitHub, Twitter} from 'react-feather'

export const GithubButton = ({dark, customCss}) => (
  <a
    aria-label="MDX GitHub repository"
    href="https://github.com/mdx-js/mdx"
    css={css({
      display: 'flex',
      alignItems: 'center',
      p: 2,
      color: 'inherit',
      ...customCss
    })}
  >
    <GitHub color={dark ? '#fff' : '#000'} />
  </a>
)

export const TwitterButton = ({dark, customCss}) => (
  <a
    aria-label="MDX Twitter Account"
    href="https://twitter.com/mdx_js"
    css={css({
      display: 'flex',
      alignItems: 'center',
      p: 2,
      color: 'inherit',
      ...customCss
    })}
  >
    <Twitter color={dark ? '#fff' : '#000'} />
  </a>
)
