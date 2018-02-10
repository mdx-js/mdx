export const arr = a => Array.isArray(a) ? a : [a]

export const EDITOR_CLASSNAME_REGEX = /language-\.(jsx|html)/
export const isLiveEditor = ({ className = [] }) =>
  !!arr(className).find(c => EDITOR_CLASSNAME_REGEX.test(c))

// TODO: Nuke me for inline support
export const RENDER_CLASSNAME_REGEX = /language-\!jsx/
export const shouldRender = ({ className = [] }) =>
  !!arr(className).find(c => EDITOR_CLASSNAME_REGEX.test(c))

export const RELATIVE_REGEX = /^\./
export const isRelativeFile = text => RELATIVE_REGEX.test(text)

export const TRANSCLUDABLE_REGEX = /\.(md|markdown|txt|jsx|html)$/
export const isTranscludable = name => TRANSCLUDABLE_REGEX.test(name)

export const TRANSCLUDABLE_IMG_REGEX = /\.(png|jpg|jpeg|svg)$/
export const isTranscludableImg = name => TRANSCLUDABLE_IMG_REGEX.test(name)
