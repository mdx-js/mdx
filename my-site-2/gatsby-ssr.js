import {MDXProvider} from '@mdx-js/tag'

const components = {h1: props => <h5 {...props} />}

export const wrapRootElement = ({element}) => {
  return <MDXProvider>{element}</MDXProvider>
}
