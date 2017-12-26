const RELATIVE_REGEX = /^\./

export default text => RELATIVE_REGEX.test(text)
