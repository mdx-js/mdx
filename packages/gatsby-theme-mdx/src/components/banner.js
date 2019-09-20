import React from 'react'
import {css} from 'theme-ui'

export default props => (
  <div
    {...props}
    css={css({
      fontWeight: 'bold',
      m: 0,
      p: 3,
      color: 'background',
      bg: 'primary'
    })}
  />
)
