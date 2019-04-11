import React from 'react'
import css from '@styled-system/css'

export default props => (
  <div
    {...props}
    css={theme =>
      css({
        fontWeight: 'bold',
        my: 4,
        p: 3,
        color: theme.dark ? 'background' : 'inherit',
        bg: 'yellow'
      })(theme)
    }
  />
)
