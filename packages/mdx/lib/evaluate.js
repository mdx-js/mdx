/**
 * @typedef {import('mdx/types.js').MDXModule} MDXModule
 * @typedef {import('vfile').Compatible} Compatible
 * @typedef {import('./util/resolve-evaluate-options.js').EvaluateOptions} EvaluateOptions
 */

import {resolveEvaluateOptions} from './util/resolve-evaluate-options.js'
import {compile, compileSync} from './compile.js'
import {run, runSync} from './run.js'

/**
 * Evaluate MDX.
 *
 * @param {Readonly<Compatible>} vfileCompatible
 *   MDX document to parse (`string`, `Buffer`, `vfile`, anything that can be
 *   given to `vfile`).
 * @param {Readonly<EvaluateOptions>} evaluateOptions
 *   Configuration for evaluation.
 * @return {Promise<MDXModule>}
 *   Export map.
 */
export async function evaluate(vfileCompatible, evaluateOptions) {
  const {compiletime, runtime} = resolveEvaluateOptions(evaluateOptions)
  return run(await compile(vfileCompatible, compiletime), runtime)
}

/**
 * Synchronously evaluate MDX.
 *
 * @param {Readonly<Compatible>} vfileCompatible
 *   MDX document to parse (`string`, `Buffer`, `vfile`, anything that can be
 *   given to `vfile`).
 * @param {Readonly<EvaluateOptions>} evaluateOptions
 *   Configuration for evaluation.
 * @return {MDXModule}
 *   Export map.
 */
export function evaluateSync(vfileCompatible, evaluateOptions) {
  const {compiletime, runtime} = resolveEvaluateOptions(evaluateOptions)
  return runSync(compileSync(vfileCompatible, compiletime), runtime)
}
