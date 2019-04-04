import React from 'react'
import css from '@styled-system/css'

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
