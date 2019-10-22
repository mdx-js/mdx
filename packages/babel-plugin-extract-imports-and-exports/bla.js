const babel = require('@babel/core')

const BabelPluginExtractImportNames = require('.')
const plugin = new BabelPluginExtractImportNames()

const jsx = `
  import Foo from './foo'
  export default props => <article {...props} />
  const test = "Test"
  export const bar = "Bar"
`

babel.transform(jsx, {
  configFile: false,
  plugins: ['@babel/plugin-syntax-jsx', plugin.plugin]
})

console.log(plugin.state)
