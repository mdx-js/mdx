import React from 'react'

const known = new Set(['info', 'legacy', 'important'])

export const Note = (props) => {
  const {children, type} = props
  const className = ['note']

  if (known.has(type)) className.push(type)
  else {
    throw new Error('Unknown note type `' + type + '`')
  }

  return <div className={className.join(' ')}>{children}</div>
}
