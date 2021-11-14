import React from 'react'

/**
 * @param {Record<string, unknown>} props
 */
export const Pill = (props) =>
  React.createElement('span', {...props, style: {color: 'red'}})

/**
 * @param {Record<string, unknown>} props
 */
export const Layout = (props) =>
  React.createElement('div', {...props, style: {color: 'red'}})

export default Layout
