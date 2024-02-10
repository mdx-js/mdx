import React from 'react'

/**
 * @param {Readonly<JSX.IntrinsicElements['span']>} properties
 *   Properties.
 * @returns
 *   `span` element.
 */
export function Pill(properties) {
  return React.createElement('span', {...properties, style: {color: 'red'}})
}

/**
 * @param {Readonly<JSX.IntrinsicElements['div']>} properties
 *   Properties.
 * @returns
 *   `div` element.
 */
export function Layout(properties) {
  return React.createElement('div', {...properties, style: {color: 'red'}})
}

export default Layout
