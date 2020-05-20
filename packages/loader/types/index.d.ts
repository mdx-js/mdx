// TypeScript Version: 3.4

import {ComponentType} from 'react'

declare module '*.mdx' {
  const MDXComponent: ComponentType
  export default MDXComponent
}
