import React from 'react'
import css from '@styled-system/css'
import Moon from './moon'
import Circle from './circle'

export default ({dark, setDark, ...props}) => (
  <button
    title={dark ? 'Disable Dark Mode' : 'Enable Dark Mode'}
    {...props}
    css={css({
      appearance: 'none',
      color: 'yellow',
      bg: 'transparent',
      border: 0,
      borderRadius: 99999,
      mr: 2,
      p: 1,
      '&:focus': {
        outline: 'none',
        boxShadow: '0 0 0 2px'
      }
    })}
    onClick={() => {
      setDark(!dark)
    }}
  >
    {dark ? <Circle /> : <Moon />}
  </button>
)
