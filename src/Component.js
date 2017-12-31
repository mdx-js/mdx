import React from 'react'
import PropTypes from 'prop-types'

import { md } from './'

export default ({
  text = '',
  components = {},
  scope = {},
  ...options
}) => md(text, {
  scope,
  components,
  ...options
})
