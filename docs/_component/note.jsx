/**
 * @typedef {import('react').ReactNode} ReactNode
 */

/**
 * @typedef {'important' | 'info' | 'legacy'} NoteType
 *   Type.
 *
 * @typedef Props
 *   Props for `Note`.
 * @property {NoteType} type
 *   Kind.
 * @property {Readonly<ReactNode>} children
 *   Children.
 */

import React from 'react'

/** @type {Set<NoteType>} */
const known = new Set(['info', 'legacy', 'important'])

/**
 * @param {Readonly<Props>} props
 *   Props.
 * @returns {JSX.Element}
 *   Element.
 */
export function Note(props) {
  const {children, type} = props
  const className = ['note']

  if (known.has(type)) className.push(type)
  else {
    throw new Error('Unknown note type `' + type + '`')
  }

  return <div className={className.join(' ')}>{children}</div>
}
