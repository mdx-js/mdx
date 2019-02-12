module.exports = [
  {
    description: 'Handles basic usecase of default export',
    mdx: 'export default props => <article {...props} />'
  },
  {
    description: 'Handles an import that is later exported',
    mdx: ["import Layout from './Foo'", '', 'export default Layout'].join('\n')
  },
  {
    description: 'Separates import from the default export',
    mdx: [
      "import Foo from './foo'",
      'export default props => <article {...props} />'
    ].join('\n')
  },
  {
    description: 'Handles other types of exports',
    mdx: 'export const metadata = { some: "stuff" }'
  }
]
