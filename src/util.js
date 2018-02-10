export const arr = a => Array.isArray(a) ? a : [a]

export const EDITOR_CLASSNAME_REGEX = /language-\.jsx/
export const isJSXCodeBlock = ({ className = [] }) =>
  !!arr(className).find(c => EDITOR_CLASSNAME_REGEX.test(c))

export const RELATIVE_REGEX = /^\./
export const isRelativeFile = text => RELATIVE_REGEX.test(text)

export const TRANSCLUDABLE_REGEX = /\.(md|markdown|txt|jsx|html)$/
export const isTranscludable = name => TRANSCLUDABLE_REGEX.test(name)

export const TRANSCLUDABLE_IMG_REGEX = /\.(png|jpg|jpeg|svg)$/
export const isTranscludableImg = name => TRANSCLUDABLE_IMG_REGEX.test(name)

export const IMPORT_REGEX = /\import/
export const isImport = text => IMPORT_REGEX.test(text)
