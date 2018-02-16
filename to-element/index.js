const React = require('react')
const babel = require('babel-standalone')

const parse = raw => babel.transform(raw, {
  plugins: [
    require('babel-plugin-transform-react-jsx')
  ]
}).code

module.exports = (jsx, scope = {}) => {
  const code = parse(jsx.trim())
  const keys = Object.keys(scope)
  const values = keys.map(k => scope[k])
  const fn = new Function('React', ...keys, `return ${code}`)
  const el = fn(React, ...values)

  return el
}
