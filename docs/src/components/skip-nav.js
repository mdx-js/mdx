import React from 'react'
import {SkipNavLink as Link} from '@reach/skip-nav'
export {SkipNavContent} from '@reach/skip-nav'

export const SkipNavLink = props => (
  <Link
    {...props}
    css={{
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      width: 1,
      margin: -1,
      padding: 0,
      overflow: 'hidden',
      position: 'absolute',
      '&:focus': {
        padding: 16,
        position: 'fixed',
        top: 8,
        left: 8,
        backgroundColor: 'white',
        zIndex: 1,
        width: 'auto',
        height: 'auto',
        clip: 'auto'
      }
    }}
  />
)
