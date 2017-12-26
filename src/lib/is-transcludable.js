const TRANSCLUDABLE_REGEX = /\.(md|markdown|txt|jsx|html)$/

export default name => TRANSCLUDABLE_REGEX.test(name)
