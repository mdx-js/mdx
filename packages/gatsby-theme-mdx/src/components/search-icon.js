import React from 'react'

export default ({size = 16, ...props}) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="currentcolor"
    style={{
      display: 'block',
      verticalAlign: 'middle',
      overflow: 'visible'
    }}
  >
    <path
      d={`
      M12 0 A12 12 0 0 0 0 12 A12 12 0 0 0 12 24 A12 12 0 0 0 18.5 22.25 L28 32 L32 28 L22.25 18.5 A12 12 0 0 0 24 12 A12 12 0 0 0 12 0 M12 4 A8 8 0 0 1 12 20 A8 8 0 0 1 12 4
      `}
    />
  </svg>
)
