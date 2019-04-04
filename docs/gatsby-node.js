// Hack for importing `@mdx-js/mdx` in the CodeEditor component
// NOT RECOMMENDED
exports.onCreateWebpackConfig = ({actions}) => {
  actions.setWebpackConfig({
    node: {
      fs: 'empty'
    }
  })
}
