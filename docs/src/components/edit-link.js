import React from 'react'
import {Location} from '@reach/router'
import css from '@styled-system/css'

const base = 'https://github.com/mdx-js/mdx/edit/master/docs/src/pages'

export default () => (
  <Location>
    {({location}) => (
      <a
        href={base + location.pathname + '.md'}
        css={css({
          display: 'inline-block',
          color: 'inherit',
          fontSize: 1,
          my: 4
        })}
      >
        Edit this page on GitHub
      </a>
    )}
  </Location>
)
