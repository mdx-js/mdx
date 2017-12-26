import React from 'react'

import content from './markdown'
import markdown from '../../src'
// import markdown from '@compositor/markdown'

const h1 = props => <h1 style={{color: 'tomato'}} {...props} />

export default () =>
  <div>
    {markdown(content, { mdComponents: { h1 } })}
  </div>
