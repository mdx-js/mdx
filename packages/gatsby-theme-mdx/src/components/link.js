import React from 'react'
import {Link} from 'gatsby'
import isAbsoluteURL from 'is-absolute-url'

const isHash = str => /^#/.test(str)

export default ({href, ...props}) =>
  isAbsoluteURL(href) || isHash(href) ? (
    // eslint-disable-next-line
    <a href={href} {...props} />
  ) : (
    <Link to={href} activeClassName="active" {...props} />
  )
