import React from 'react'
import {withRouteData} from 'react-static'
import {Link} from '@reach/router'

export default withRouteData(({post}) => (
  <div>
    <Link to="/blog/">{'<'} Back</Link>
    <br />
    <h3>{post.title}</h3>
    <p>{post.body}</p>
  </div>
))
