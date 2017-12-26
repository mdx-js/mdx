const TRANSCLUDABLE_IMG_REGEX = /\.(png|jpg|jpeg|svg)$/

export default name => TRANSCLUDABLE_IMG_REGEX.test(name)
