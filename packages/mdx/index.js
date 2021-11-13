/**
 * @typedef {import('./lib/core.js').ProcessorOptions} ProcessorOptions
 * @typedef {import('./lib/compile.js').CompileOptions} CompileOptions
 * @typedef {import('./lib/evaluate.js').EvaluateOptions} EvaluateOptions
 */

export {createProcessor} from './lib/core.js'
export {compile, compileSync} from './lib/compile.js'
export {evaluate, evaluateSync} from './lib/evaluate.js'
export {run, runSync} from './lib/run.js'
export {nodeTypes} from './lib/node-types.js'
