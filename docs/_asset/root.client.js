import React, {Suspense} from 'react'

export const Root = (props) => {
  const {response} = props

  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  )

  function Content() {
    return response.readRoot()
  }
}
