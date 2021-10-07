import React from 'react'

export const Note = (props) => {
  const {children, type} = props
  const className = ['note']

  if (type === 'info') className.push(type)

  return (
    <div className={className.join(' ')}>
      <div className="note-inside">{children}</div>
    </div>
  )
}
