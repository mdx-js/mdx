module.exports = (api, options) => {
  const {types: t} = api
  const {wrapper} = options

  return {
    visitor: {
      ExportDefaultDeclaration(path) {
        if (!wrapper) {
          return
        }

        path.node.declaration = t.callExpression(t.identifier(wrapper), [
          path.node.declaration
        ])
      }
    }
  }
}
