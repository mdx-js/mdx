/**
 * @typedef {import('mdx/types.js').MDXComponents} Components
 * @typedef {import('../core.js').ProcessorOptions} ProcessorOptions
 */

/**
 * @typedef {JSX.Element | string | null | undefined} Child
 *   Child.
 *
 * @typedef {EvaluateProcessorOptions & RunnerOptions} EvaluateOptions
 *   Configuration for evaluation.
 *
 * @typedef {Omit<ProcessorOptions, 'jsx' | 'jsxImportSource' | 'jsxRuntime' | 'pragma' | 'pragmaFrag' | 'pragmaImportSource' | 'providerImportSource' | 'outputFormat'> } EvaluateProcessorOptions
 *   Compile configuration without JSX options for evaluation.
 *
 * @typedef {unknown} Fragment
 *   Represent the children, typically a symbol.
 *
 * @callback Jsx
 *   Create a production element.
 * @param {unknown} type
 *   Element type: `Fragment` symbol, tag name (`string`), component.
 * @param {Props} props
 *   Element props, `children`, and maybe `node`.
 * @param {string | undefined} [key]
 *   Dynamicly generated key to use.
 * @returns {JSX.Element}
 *   An element from your framework.
 *
 * @callback JsxDev
 *   Create a development element.
 * @param {unknown} type
 *   Element type: `Fragment` symbol, tag name (`string`), component.
 * @param {Props} props
 *   Element props, `children`, and maybe `node`.
 * @param {string | undefined} key
 *   Dynamicly generated key to use.
 * @param {boolean} isStaticChildren
 *   Whether two or more children are passed (in an array), which is whether
 *   `jsxs` or `jsx` would be used.
 * @param {Source} source
 *   Info about source.
 * @param {undefined} self
 *   Nothing (this is used by frameworks that have components, we don’t).
 * @returns {JSX.Element}
 *   An element from your framework.
 *
 * @callback MergeComponents
 *   Custom merge function.
 * @param {Components} currentComponents
 *   Current components from the context.
 * @returns {Components}
 *   Merged components.
 *
 * @typedef {{children?: Array<Child> | Child, node?: Element | undefined, [prop: string]: Array<Child> | Child | Element | Value | undefined}} Props
 *   Properties and children.
 *
 * @typedef RunnerOptions
 *   Configuration with JSX runtime.
 * @property {Fragment} Fragment
 *   Symbol to use for fragments.
 * @property {Jsx | null | undefined} [jsx]
 *   Function to generate an element with static children in production mode.
 * @property {Jsx | null | undefined} [jsxs]
 *   Function to generate an element with dynamic children in production mode.
 * @property {JsxDev | null | undefined} [jsxDEV]
 *   Function to generate an element in development mode.
 * @property {UseMdxComponents | null | undefined} [useMDXComponents]
 *   Function to get `MDXComponents` from context.
 *
 * @typedef RuntimeDevelopment
 *   Runtime fields when development is on.
 * @property {Fragment} Fragment
 *   Fragment.
 * @property {Jsx | null | undefined} [jsx]
 *   Dynamic JSX (optional).
 * @property {JsxDev} jsxDEV
 *   Development JSX.
 * @property {Jsx | null | undefined} [jsxs]
 *   Static JSX (optional).
 *
 * @typedef RuntimeProduction
 *   Runtime fields when development is off.
 * @property {Fragment} Fragment
 *   Fragment.
 * @property {Jsx} jsx
 *   Dynamic JSX.
 * @property {JsxDev | null | undefined} [jsxDEV]
 *   Development JSX (optional).
 * @property {Jsx} jsxs
 *   Static JSX.
 *
 * @typedef Source
 *   Info about source.
 * @property {number | undefined} columnNumber
 *   Column where thing starts (0-indexed).
 * @property {string | undefined} fileName
 *   Name of source file.
 * @property {number | undefined} lineNumber
 *   Line where thing starts (1-indexed).
 *
 * @typedef {Record<string, string>} Style
 *   Style map.
 *
 * @callback UseMdxComponents
 *   Get current components from the MDX Context.
 * @param {Components | MergeComponents | null | undefined} [components]
 *   Additional components to use or a function that takes the current
 *   components and filters/merges/changes them.
 * @returns {Components}
 *   Current components.
 *
 * @typedef {Style | boolean | number | string} Value
 *   Primitive property value and `Style` map.
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
