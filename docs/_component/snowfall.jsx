/**
 * @typedef Props
 *   Props.
 * @property {string} color
 *   Color.
 * @property {number} year
 *   Year.
 */

import React from 'react'

const data = [6, 5, 2, 4.5, 1.5, 2.5, 2, 2.5, 1.5, 2.5, 3.5, 7]

/**
 * @param {Readonly<Props>} props
 *   Props.
 * @returns {JSX.Element}
 *   Element.
 */
export function Chart(props) {
  return (
    <div className="snowfall">
      {data.map(function (d) {
        return (
          <div
            key={d}
            className="snowfall-bar"
            style={{
              backgroundColor: props.color,
              height: 'calc(' + d + ' * 0.5 * (1em + 1ex))'
            }}
          />
        )
      })}
    </div>
  )
}
