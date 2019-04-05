import React from 'react'

const rad = n => (Math.PI * n) / 180
const rx = (r, n) => r * Math.cos(rad(n))
const ry = (r, n) => r * Math.sin(rad(n))

const c = (center = 8, radius) => angle => [
  center + rx(radius, angle),
  center + ry(radius, angle)
]
const circle = c(8, 6)

export default ({size = 24}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width={size}
    height={size}
    fill="currentcolor"
    style={{
      display: 'block'
    }}
  >
    <path
      fill="black"
      d={`
        M 8 0
        A 8 8 0 0 0 8 16
        A 8 8 0 0 0 8 0
      `}
    />
    <path
      d={`
        M 8 2
        A 6 6 0 0 0 8 14
        A 8 14 0 0 0 ${circle(30)}
        A 6 6 0 0 1 8 2
        z
      `}
    />
  </svg>
)
