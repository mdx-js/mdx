/**
 * @import {ReactNode} from 'react'
 */

/**
 * @typedef {'important' | 'info' | 'legacy'} NoteType
 *   Type.
 *
 * @typedef Properties
 *   Properties for `Note`.
 * @property {NoteType} type
 *   Kind.
 * @property {Readonly<ReactNode>} children
 *   Children.
 */

import React from 'react'

/** @type {Set<NoteType>} */
const known = new Set(['info', 'legacy', 'important'])

/**
 * @param {Readonly<Properties>} properties
 *   Properties.
 * @returns {ReactNode}
 *   Element.
 */
export function Note(properties) {
  const {children, type} = properties
  const className = ['note']

  if (known.has(type)) className.push(type)
  else {
    throw new Error('Unknown note type `' + type + '`')
  }

  return <div className={className.join(' ')}>{children}</div>
}
