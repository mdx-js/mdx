import React from 'react'
import {LiveProvider, LivePreview, LiveEditor, LiveError} from 'react-live'
import mdx from '@mdx-js/mdx'
import * as Rebass from '@rebass/emotion'
import {prismTheme} from './code-block'

const transformCode = isMDX =>
  isMDX ? src => mdx.sync(src, {skipExport: true}) : src => `<>${src}</>`

const defaultScope = {
  ...Rebass
}

export default ({
  code,
  scope = defaultScope,
  mdx,
  editable = true,
  ...props
}) => {
  return (
    <LiveProvider
      {...props}
      code={code}
      scope={scope}
      transformCode={transformCode(mdx)}
      theme={prismTheme}
    >
      <LivePreview />
      {editable && <LiveEditor />}
      <LiveError />
    </LiveProvider>
  )
}
