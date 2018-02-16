import React from 'react'

export default (Component, style = {}) => props => {
  if (!props.id) return <Component {...props} />

  return (
  <a
    href={`#${props.id}`}
    style={style}
  >
    <Component {...props} />
  </a>
  )
}
