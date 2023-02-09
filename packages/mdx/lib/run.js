/** @type {new (code: string, ...args: Array<unknown>) => Function} **/
const AsyncFunction = Object.getPrototypeOf(run).constructor

/**
 * Asynchronously run code.
 *
 * @param {{toString(): string}} file
 *   JS document to run.
 * @param {unknown} options
 *   Parameter.
 * @return {Promise<any>}
 *   Anthing.
 */
export async function run(file, options) {
  return new AsyncFunction(String(file))(options)
}

/**
 * Synchronously run code.
 *
 * @param {{toString(): string}} file
 *   JS document to run.
 * @param {unknown} options
 *   Parameter.
 * @return {any}
 *   Anthing.
 */
export function runSync(file, options) {
  // eslint-disable-next-line no-new-func
  return new Function(String(file))(options)
}
