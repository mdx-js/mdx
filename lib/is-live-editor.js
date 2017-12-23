const EDITOR_CLASSNAME = 'language-.jsx'
module.exports = (node = {}) => {
  if (node.tagName !== 'pre') {
    return false
  }

  const children = node.children || []

  return children
    .filter(c => c.tagName === 'code')
    .map(c => c.properties && c.properties.className || [])
    .some(c => c.includes(EDITOR_CLASSNAME))
}

