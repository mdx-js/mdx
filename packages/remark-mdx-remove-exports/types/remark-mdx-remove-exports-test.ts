import * as unified from 'unified'
import * as mdxRemoveExports from 'remark-mdx-remove-exports'

unified().use(mdxRemoveExports)
