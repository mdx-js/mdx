import React from 'react'

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
      d={`
        M 8 0
        A 8 8 0 0 0 8 16
        A 8 8 0 0 0 8 0
      `}
    />
  </svg>
)
