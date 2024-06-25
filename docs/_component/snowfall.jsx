/**
 * @import {ReactNode} from 'react'
 */

/**
 * @typedef Properties
 *   Properties.
 * @property {string} color
 *   Color.
 * @property {number} year
 *   Year.
 */

import React from 'react'

const data = [6, 5, 2, 4.5, 1.5, 2.5, 2, 2.5, 1.5, 2.5, 3.5, 7]

/**
 * @param {Readonly<Properties>} properties
 *   Properties.
 * @returns {ReactNode}
 *   Element.
 */
export function Chart(properties) {
  return (
    <div className="snowfall">
      {data.map(function (d) {
        return (
          <div
            key={d}
            className="snowfall-bar"
            style={{
              backgroundColor: properties.color,
              height: 'calc(' + d + ' * 0.5 * (1em + 1ex))'
            }}
          />
        )
      })}
    </div>
  )
}
