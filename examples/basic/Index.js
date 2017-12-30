import React from 'react'

import content from './markdown'
import { Markdown } from '../../src'
// import markdown from '@compositor/markdown'

const H1 = props => <h1 style={{ color: 'tomato' }} {...props} />
const Box = props => <div style={{ border: 'thin solid purple' }} {...props} />

export default () =>
  <Markdown
    text={content}
    transclude={false}
    components={{
      h1: H1
    }}
    scope={{
      Box
    }}
  />
