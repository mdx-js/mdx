/** @type {new (code: string, ...args: Array<unknown>) => Function} **/
const AsyncFunction = Object.getPrototypeOf(run).constructor

/**
 * Asynchronously run code.
 *
 * @param {{toString(): string}} file
 *   JS document to run.
 * @param {unknown} options
 * @return {Promise<*>}
 */
export async function run(file, options) {
  // V8 on Erbium.
  /* c8 ignore next 2 */
  return new AsyncFunction(String(file))(options)
}

/**
 * Synchronously run code.
 *
 * @param {{toString(): string}} file
 *   JS document to run.
 * @param {unknown} options
 * @return {*}
 */
export function runSync(file, options) {
  // eslint-disable-next-line no-new-func
  return new Function(String(file))(options)
}
