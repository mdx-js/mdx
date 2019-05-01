/* eslint-env browser */
import React, {useState} from 'react'

import PlaygroundEditor from '../components/playground-editor'

export default () => {
  const initialValue =
    typeof window !== 'undefined' && window.localStorage.lastMDXPlayground
  const [code, setCode] = useState(initialValue || '# Hello, world!')
  return (
    <PlaygroundEditor
      code={code}
      onChange={value => {
        setCode(value)
        if (typeof window !== 'undefined') {
          window.localStorage.lastMDXPlayground = value
        }
      }}
    />
  )
}
