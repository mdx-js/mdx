import React from 'react'
import PropTypes from 'prop-types'

import { md } from './'

export default ({
  text = '',
  components = {},
  ...options
}) => {
  const Document = md(text, {
    components,
    ...options
  })

  return <Document />
}
