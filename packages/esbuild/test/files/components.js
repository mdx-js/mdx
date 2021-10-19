import React from 'react'

/**
 * @param {Object.<string, unknown>} props
 */
export function Pill(props) {
  return React.createElement('span', {...props, style: {color: 'red'}})
}

/**
 * @param {Object.<string, unknown>} props
 */
export function Layout(props) {
  return React.createElement('div', {...props, style: {color: 'red'}})
}

export default Layout
