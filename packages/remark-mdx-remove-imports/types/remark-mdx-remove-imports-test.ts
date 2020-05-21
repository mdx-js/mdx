import * as unified from 'unified'
import * as mdxRemoveImports from 'remark-mdx-remove-imports'

unified().use(mdxRemoveImports)
