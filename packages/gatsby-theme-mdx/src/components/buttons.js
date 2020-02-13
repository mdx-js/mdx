import React from 'react'
import {css} from 'theme-ui'

export const GithubButton = ({dark, customCss}) => (
  <a
    href="https://github.com/mdx-js/mdx"
    css={css({
      display: 'flex',
      alignItems: 'center',
      p: 2,
      color: 'inherit',
      ...customCss
    })}
  >
    <img
      src={`https://icon.now.sh/github/24/${dark ? 'fff' : '000'}`}
      alt="GitHub logo"
    />
  </a>
)

export const TwitterButton = ({dark, customCss}) => (
  <a
    href="https://twitter.com/mdx_js"
    css={css({
      display: 'flex',
      alignItems: 'center',
      p: 2,
      color: 'inherit',
      ...customCss
    })}
  >
    <img
      src={`https://icon.now.sh/twitter/24/${dark ? 'fff' : '000'}`}
      alt="Twitter logo"
    />
  </a>
)
