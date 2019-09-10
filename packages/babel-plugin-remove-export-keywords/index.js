module.exports = () => {
  return {
    visitor: {
      ExportDefaultDeclaration(path) {
        // Default exports should be removed, if they're
        // meaningful, such as "export default SomeComponent",
        // the component would already be instantiated.
        path.remove()
      },

      ExportNamedDeclaration(path) {
        const declaration = path.node.declaration

        // Ignore "export { Foo as default }" syntax
        if (declaration) {
          path.replaceWith(declaration)
        }
      }
    }
  }
}
