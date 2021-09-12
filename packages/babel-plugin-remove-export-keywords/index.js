module.exports = () => ({
  visitor: {
    ExportNamedDeclaration(path) {
      const {declaration} = path.node

      // Ignore "export { Foo as default }" syntax
      if (declaration) {
        path.replaceWith(declaration)
      }
    }
  }
})
