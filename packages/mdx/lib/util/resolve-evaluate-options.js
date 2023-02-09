/**
 * @typedef {import('../core.js').ProcessorOptions} ProcessorOptions
 *
 * @typedef RunnerOptions
 *   Configuration with JSX runtime.
 * @property {any} Fragment
 *   Symbol to use for fragments.
 * @property {any} [jsx]
 *   Function to generate an element with static children in production mode.
 * @property {any} [jsxs]
 *   Function to generate an element with dynamic children in production mode.
 * @property {any} [jsxDEV]
 *   Function to generate an element in development mode.
 * @property {any} [useMDXComponents]
 *   Function to get `MDXComponents` from context.
 *
 * @typedef {Omit<ProcessorOptions, 'jsx' | 'jsxImportSource' | 'jsxRuntime' | 'pragma' | 'pragmaFrag' | 'pragmaImportSource' | 'providerImportSource' | 'outputFormat'> } EvaluateProcessorOptions
 *   Compile configuration without JSX options for evaluation.
 *
 * @typedef {EvaluateProcessorOptions & RunnerOptions} EvaluateOptions
 *   Configuration for evaluation.
 */

/**
 * Split compiletime options from runtime options.
 *
 * @param {EvaluateOptions | null | undefined} options
 * @returns {{compiletime: ProcessorOptions, runtime: RunnerOptions}}
 */
export function resolveEvaluateOptions(options) {
  const {development, Fragment, jsx, jsxs, jsxDEV, useMDXComponents, ...rest} =
    options || {}

  if (!Fragment) throw new Error('Expected `Fragment` given to `evaluate`')
  if (development) {
    if (!jsxDEV) throw new Error('Expected `jsxDEV` given to `evaluate`')
  } else {
    if (!jsx) throw new Error('Expected `jsx` given to `evaluate`')
    if (!jsxs) throw new Error('Expected `jsxs` given to `evaluate`')
  }

  return {
    compiletime: {
      ...rest,
      development,
      outputFormat: 'function-body',
      providerImportSource: useMDXComponents ? '#' : undefined
    },
    runtime: {Fragment, jsx, jsxs, jsxDEV, useMDXComponents}
  }
}
