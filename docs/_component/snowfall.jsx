/**
 * @typedef Props
 * @property {string} color
 * @property {number} year
 */

import React from 'react'

const data = [6, 5, 2, 4.5, 1.5, 2.5, 2, 2.5, 1.5, 2.5, 3.5, 7]

/**
 * @param {Props} props
 *   Props.
 * @returns {JSX.Element}
 *   Element.
 */
export function Chart(props) {
  return (
    <div className="snowfall">
      {data.map((d, i) => (
        <div
          /* eslint-disable-next-line react/no-array-index-key */
          key={i}
          className="snowfall-bar"
          style={{
            height: 'calc(' + d + ' * 0.5 * (1em + 1ex))',
            backgroundColor: props.color
          }}
        />
      ))}
    </div>
  )
}
