import {Suspense} from 'react'

export function Root(props) {
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
