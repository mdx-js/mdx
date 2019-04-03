import React from 'react'
import css from '@styled-system/css'

export default props => (
  <div
    {...props}
    css={css({
      fontWeight: 'bold',
      my: 4,
      p: 3,
      bg: 'yellow'
    })}
  />
)
