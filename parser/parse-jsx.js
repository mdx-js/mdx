const babylon = require('babylon')

module.exports = jsx =>
  babylon.parse(jsx, {
    sourceType: 'module',
    plugins: [
      'jsx'
    ]
  })
