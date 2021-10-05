# `@mdx-js/mdx`

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

MDX compiler.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`compile(file, options?)`](#compilefile-options)
    *   [`compileSync(file, options?)`](#compilesyncfile-options)
    *   [`evaluate(file, options)`](#evaluatefile-options)
    *   [`evaluateSync(file, options)`](#evaluatesyncfile-options)
    *   [`createProcessor(options)`](#createprocessoroptions)
*   [Types](#types)
*   [Security](#security)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a compiler that turns MDX into JavaScript.
It can also evaluate MDX code.

## When should I use this?

This is the core compiler for turning MDX into JavaScript and which gives you
the most control.
If you’re using a bundler (webpack, rollup, esbuild), or a site builder (gatsby,
next) or build system (vite, snowpack) which comes with a bundler, you’re better
off using an integration: see [§ Integrations](#).

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install @mdx-js/mdx
```

[yarn][]:

```sh
yarn add @mdx-js/mdx
```

## Use

This section describes how to use the API.
See [§ MDX syntax](#) on how the format works.
See [§ Integrations](#) on how to use MDX with Babel, esbuild,
Rollup, webpack, etc.

Say we have an MDX document, `example.mdx`:

```mdx
export const Thing = () => <>World!</>

# Hello, <Thing />
```

First, a rough idea of what the result will be.
The below is not the actual output, but it might help to form a mental model:

```js
/* @jsxRuntime automatic @jsxImportSource react */

export const Thing = () => <>World!</>

export default function MDXContent() {
  return <h1>Hello, <Thing /></h1>
}
```

Some observations:

*   The output is serialized JavaScript that still needs to be evaluated
*   A comment is injected to configure how JSX is handled
*   It’s a complete file with import/exports
*   A component (`MDXContent`) is exported

Now for how to get the actual output.
Add some code in `example.js` to compile `example.mdx` to JavaScript:

```js
import {promises as fs} from 'node:fs'
import {compile} from '@mdx-js/mdx'

main()

async function main() {
  const compiled = await compile(await fs.readFile('example.mdx'))
  console.log(String(compiled))
}
```

The *actual* output of running `node example.js` is:

```js
/* @jsxRuntime automatic @jsxImportSource react */
import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from 'react/jsx-runtime'

export const Thing = () => _jsx(_Fragment, {children: 'World!'})

function MDXContent(props = {}) {
  const _components = Object.assign({h1: 'h1'}, props.components)
  const {wrapper: MDXLayout} = _components
  const _content = _jsx(_Fragment, {
    children: _jsxs(_components.h1, {
      children: ['Hello, ', _jsx(Thing, {})]
    })
  })
  return MDXLayout
    ? _jsx(MDXLayout, Object.assign({}, props, {children: _content}))
    : _content
}

export default MDXContent
```

Some more observations:

*   JSX is compiled away to function calls and an import of React†
*   The content component can be given `{components: {h1: MyComponent}}` to use
    something else for the heading
*   The content component can be given `{components: {wrapper: MyLayout}}` to
    wrap the whole content

† `@mdx-js/mdx` is not coupled to React.
You can also use it with [Preact](#), [Vue](#), [Emotion](#), [Theme UI](#),
etc.
Both the classic and automatic JSX runtimes are supported.

See [§ MDX content](#) below on how to use the result.

## API

This package exports the following identifiers:
[`compile`][compile],
[`compileSync`](#compilesyncfile-options),
[`evaluate`][eval],
[`evaluateSync`](#evaluatesyncfile-options), and
[`createProcessor`](#createprocessoroptions).
There is no default export.

### `compile(file, options?)`

Compile MDX to JS.

###### `file`

MDX document to parse (`string`, [`Buffer`][buffer] in UTF-8, [`vfile`][vfile],
or anything that can be given to `vfile`).

<details>
<summary>Example</summary>

```js
import {VFile} from 'vfile'
import {compile} from '@mdx-js/mdx'

await compile(':)')
await compile(Buffer.from(':-)'))
await compile({path: 'path/to/file.mdx', value: '🥳'})
await compile(new VFile({path: 'path/to/file.mdx', value: '🤭'}))
```

</details>

###### `options.remarkPlugins`

List of [remark plugins][remark-plugins], presets, and pairs.

<details>
<summary>Example</summary>

```js
import remarkFrontmatter from 'remark-frontmatter' // YAML and such.
import remarkGfm from 'remark-gfm' // Tables, footnotes, strikethrough, tasklists, literal URLs.

await compile(file, {remarkPlugins: [remarkGfm]}) // One plugin.
await compile(file, {remarkPlugins: [[remarkFrontmatter, 'toml']]}) // A plugin with options.
await compile(file, {remarkPlugins: [remarkGfm, remarkFrontmatter]}) // Two plugins.
await compile(file, {remarkPlugins: [[remarkGfm, {singleTilde: false}], remarkFrontmatter]}) // Two plugins, first w/ options.
```

</details>

###### `options.rehypePlugins`

List of [rehype plugins][rehype-plugins], presets, and pairs.

<details>
<summary>Example</summary>

```js
import rehypeKatex from 'rehype-katex' // Render math with KaTeX.
import remarkMath from 'remark-math' // Support math like `$so$`.

await compile(file, {remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex]})

await compile(file, {
  remarkPlugins: [remarkMath],
  // A plugin with options:
  rehypePlugins: [[rehypeKatex, {throwOnError: true, strict: true}]]
})
```

</details>

###### `options.recmaPlugins`

List of recma plugins.
This is a new ecosystem, currently in beta, to transform
[esast](https://github.com/syntax-tree/esast) trees (JavaScript).

###### `options.mdExtensions`

List of markdown extensions, with dot (`string[]`, default: `['.md',
'.markdown', '.mdown', '.mkdn', '.mkd', '.mdwn', '.mkdown', '.ron']`).

###### `options.mdxExtensions`

List of MDX extensions, with dot (`string[]`, default: `['.mdx']`).
Has no effect in `compile` or `evaluate` but does affect [§ Integrations](#).

###### `options.format`

Format the file is in (`'detect' | 'mdx' | 'md'`, default: `'detect'`).

*   `'detect'` — use `'markdown'` for files with an extension in `mdExtensions`
    and `'mdx'` otherwise
*   `'mdx'` — treat file as [MDX][mdx-syntax]
*   `'md'` — treat file as plain vanilla markdown

The format cannot be detected if a file is passed without a path or extension:
`mdx` will be assumed.
So pass a full vfile (with `path`) or an object with a path.

<details>
<summary>Example</summary>

```js
compile({value: '…'}) // Seen as MDX
compile({value: '…'}, {format: 'md'}) // Seen as markdown
compile({value: '…', path: 'readme.md'}) // Seen as markdown

// Please do not use `.md` for MDX as other tools won’t know how to handle it.
compile({value: '…', path: 'readme.md'}, {format: 'mdx'}) // Seen as MDX
compile({value: '…', path: 'readme.md'}, {mdExtensions: []}) // Seen as MDX
```

</details>

This option mostly affects [§ Integrations](#) because in those it affects
*which* files are “registered”:

*   `format: 'mdx'` registers the extensions in `options.mdxExtensions`
*   `format: 'md'` registers the extensions in `options.mdExtensions`
*   `format: 'detect'` registers both lists of extensions

###### `options.outputFormat`

Output format to generate (`'program' | 'function-body'`, default: `'program'`).
In most cases `'program'` should be used, as it results in a whole program.
Internally, [`evaluate`][eval] uses `outputFormat: 'function-body'` to compile
to code that can be `eval`ed.
In some cases, you might want to do what `evaluate` does in separate steps
yourself, such as when compiling on the server and running on the client.

The `'program'` format will use import statements to import the runtime (and
optionally provider) and use an export statement to yield the `MDXContent`
component.

The `'function-body'` format will get the runtime (and optionally provider) from
`arguments[0]`, rewrite export statements, and use a return statement to yield
what was exported.
Normally, this output format will throw on `import` (and `export … from`)
statements, but you can support them by setting
[`options.useDynamicImport`][usedynamicimport].

<details>
<summary>Example</summary>

A module `example.js`:

```js
import {compile} from '@mdx-js/mdx'

main('export const no = 3.14\n\n# hi {no}')

async function main(code) {
  console.log(String(await compile(code, {outputFormat: 'program'}))) // Default
  console.log(String(await compile(code, {outputFormat: 'function-body'})))
}
```

…yields:

```js
import {Fragment as _Fragment, jsx as _jsx} from 'react/jsx-runtime'
export const no = 3.14
function MDXContent(props = {}) { /* … */ }
export default MDXContent
```

```js
const {Fragment: _Fragment, jsx: _jsx} = arguments[0]
const no = 3.14
function MDXContent(props = {}) { /* … */ }
return {no, default: MDXContent}
```

</details>

###### `options.useDynamicImport`

Whether to compile to dynamic import expressions (`boolean`, default: `false`).
This option applies when [`options.outputFormat`][outputformat] is
`'function-body'`.

`@mdx-js/mdx` can turn import statements (`import x from 'y'`) into dynamic
imports (`const {x} = await import('y')`).
This is useful because import statements only work at the top level of
JavaScript modules, whereas `import()` is available inside function bodies.

When you turn `useDynamicImport` on, you should probably set [`options.baseUrl`][baseurl] too.

<details>
<summary>Example</summary>

Say we have a couple modules:

```js
// meta.js:
export const title = 'World'

// numbers.js:
export const no = 3.14

// example.js:
import {compileSync} from '@mdx-js/mdx'

const code = `import {name} from './meta.js'
export {no} from './numbers.js'

# hi {name}!`

console.log(String(compileSync(code, {outputFormat: 'function-body', useDynamicImport: true})))
```

…now running `node example.js` yields:

```js
const {Fragment: _Fragment, jsx: _jsx, jsxs: _jsxs} = arguments[0]
const {name} = await import('./meta.js')
const {no} = await import('./numbers.js')
function MDXContent(props = {}) { /* … */ }
return {no, default: MDXContent}
```

</details>

###### `options.baseUrl`

Resolve relative `import` (and `export … from`) from this URL (`string?`,
example: `import.meta.url`).

Relative specifiers are non-absolute URLs that start with `/`, `./`, or `../`.
For example: `/index.js`, `./folder/file.js`, or `../main.js`.

This option is useful when code will run in a different place.
One example is when `.mdx` files are in path *a* but compiled to path *b* and
imports should run relative the path *b*.
Another example is when evaluating code, whether in Node or a browser.

<details>
<summary>Example</summary>

Say we have a module `example.js`:

```js
import {compile} from '@mdx-js/mdx'

main()

async function main() {
  const code = 'export {number} from "./data.js"\n\n# hi'
  const baseUrl = 'https://a.full/url' // Typically `import.meta.url`
  console.log(String(await compile(code, {baseUrl})))
}
```

…now running `node example.js` yields:

```js
import {Fragment as _Fragment, jsx as _jsx} from 'react/jsx-runtime'
export {number} from 'https://a.full/data.js'
function MDXContent(props = {}) { /* … */ }
export default MDXContent
```

</details>

###### `options.SourceMapGenerator`

The `SourceMapGenerator` class from [`source-map`][source-map] (optional).
When given, the resulting file will have a `map` field set to a source map (in
object form).

<details>
<summary>Example</summary>

Assuming `example.mdx` from [§ Use][use] exists, then:

```js
import {promises as fs} from 'node:fs'
import {SourceMapGenerator} from 'source-map'
import {compile} from '@mdx-js/mdx'

main()

async function main() {
  const file = await compile(
    {path: 'example.mdx', value: await fs.readFile('example.mdx')},
    {SourceMapGenerator}
  )

  console.log(file.map)
}
```

…yields:

```js
{
  version: 3,
  sources: ['example.mdx'],
  names: ['Thing'],
  mappings: ';;aAAaA,QAAQ;YAAQ;;;;;;;;iBAE3B',
  file: 'example.mdx'
}
```

</details>

###### `options.providerImportSource`

Place to import a provider from (`string?`, example: `'@mdx-js/react'`).
Useful for runtimes that support context (React, Preact).
The provider must export a `useMDXComponents`, which is called to access an
object of components.

<details>
<summary>Example</summary>

If `file` is the contents of `example.mdx` from [§ Use][use], then:

```js
compile(file, {providerImportSource: '@mdx-js/react'})
```

…yields this difference:

```diff
 /* @jsxRuntime classic @jsx React.createElement @jsxFrag React.Fragment */
 import React from 'react'
+import {useMDXComponents as _provideComponents} from '@mdx-js/react'

 export const Thing = () => React.createElement(React.Fragment, null, 'World!')

 function MDXContent(props = {}) {
-  const _components = Object.assign({h1: 'h1'}, props.components)
+  const _components = Object.assign({h1: 'h1'}, _provideComponents(), props.components)
   const {wrapper: MDXLayout} = _components
   const _content = React.createElement(
     React.Fragment,
```

</details>

###### `options.jsx`

Whether to keep JSX (`boolean?`, default: `false`).
The default is to compile JSX away so that the resulting file is immediately
runnable.

<details>
<summary>Example</summary>

If `file` is the contents of `example.mdx` from [§ Use][use], then:

```js
compile(file, {jsx: true})
```

…yields this difference:

```diff
 /* @jsxRuntime classic @jsx React.createElement @jsxFrag React.Fragment */
-import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from 'react/jsx-runtime'
-
-export const Thing = () => React.createElement(React.Fragment, null, 'World!')
+export const Thing = () => <>World!</>

 function MDXContent(props = {}) {
   const _components = Object.assign({h1: 'h1'}, props.components)
   const {wrapper: MDXLayout} = _components
-  const _content = _jsx(_Fragment, {
-    children: _jsxs(_components.h1, {
-      children: ['Hello, ', _jsx(Thing, {})]
-    })
-  })
+  const _content = (
+    <>
+      <_components.h1>{'Hello, '}<Thing /></_components.h1>
+    </>
+  )
…
```

</details>

###### `options.jsxRuntime`

JSX runtime to use (`'automatic' | 'classic'`, default: `'automatic'`).
The classic runtime compiles to calls such as `h('p')`, the automatic runtime
compiles to `import _jsx from '$importSource/jsx-runtime'\n_jsx('p')`.

<details>
<summary>Example</summary>

If `file` is the contents of `example.mdx` from [§ Use][use], then:

```js
compile(file, {jsxRuntime: 'classic'})
```

…yields this difference:

```diff
-/* @jsxRuntime automatic @jsxImportSource react */
-import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from 'react/jsx-runtime'
+/* @jsxRuntime classic @jsx React.createElement @jsxFrag React.Fragment */
+import React from 'react'

-export const Thing = () => _jsx(_Fragment, {children: 'World!'})
+export const Thing = () => React.createElement(React.Fragment, null, 'World!')
…
```

</details>

###### `options.jsxImportSource`

Place to import automatic JSX runtimes from (`string?`, default: `'react'`).
When in the `automatic` runtime, this is used to define an import for
`_Fragment`, `_jsx`, and `_jsxs`.

<details>
<summary>Example</summary>

If `file` is the contents of `example.mdx` from [§ Use][use], then:

```js
compile(file, {jsxImportSource: 'preact'})
```

…yields this difference:

```diff
-/* @jsxRuntime automatic @jsxImportSource react */
-import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from 'react/jsx-runtime'
+/* @jsxRuntime automatic @jsxImportSource preact */
+import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from 'preact/jsx-runtime'
```

</details>

###### `options.pragma`

Pragma for JSX (`string?`, default: `'React.createElement'`).
When in the `classic` runtime, this is used as an identifier for function calls:
`<x />` to `React.createElement('x')`.

You should most probably define `pragmaFrag` and `pragmaImportSource` too when
changing this.

<details>
<summary>Example</summary>

If `file` is the contents of `example.mdx` from [§ Use][use], then:

```js
compile(file, {
  jsxRuntime: 'classic',
  pragma: 'preact.createElement',
  pragmaFrag: 'preact.Fragment',
  pragmaImportSource: 'preact/compat'
})
```

…yields this difference:

```diff
-/* @jsxRuntime classic @jsx React.createElement @jsxFrag React.Fragment */
-import React from 'react'
+/* @jsxRuntime classic @jsx preact.createElement @jsxFrag preact.Fragment */
+import preact from 'preact/compat'

-export const Thing = () => React.createElement(React.Fragment, null, 'World!')
+export const Thing = () => preact.createElement(preact.Fragment, null, 'World!')
…
```

</details>

###### `options.pragmaFrag`

Pragma for JSX fragments (`string?`, default: `'React.Fragment'`).
When in the `classic` runtime, this is used as an identifier for fragments: `<>`
to `React.createElement(React.Fragment)`.

See `options.pragma` for an example.

###### `options.pragmaImportSource`

Where to import the identifier of `pragma` from (`string?`, default: `'react'`).
When in the `classic` runtime, this is used to import the `pragma` function.
To illustrate with an example: when `pragma` is `'a.b'` and `pragmaImportSource`
is `'c'` this following will be generated: `import a from 'c'`.

See `options.pragma` for an example.

###### Returns

`Promise.<VFile>` — Promise that resolves to the compiled JS as a [vfile][].

<details>
<summary>Example</summary>

```js
import remarkPresetLintConsistent from 'remark-preset-lint-consistent' // Lint rules to check for consistent markdown.
import {reporter} from 'vfile-reporter'
import {compile} from '@mdx-js/mdx'

main()

async function main() {
  const file = await compile('*like this* or _like this_?', {remarkPlugins: [remarkPresetLintConsistent]})
  console.error(reporter(file))
}
```

Yields:

```txt
  1:16-1:27  warning  Emphasis should use `*` as a marker  emphasis-marker  remark-lint

⚠ 1 warning
```

</details>

### `compileSync(file, options?)`

Compile MDX to JS.
Synchronous version of `compile`.
When possible please use the async `compile`.

### `evaluate(file, options)`

Compile and run MDX.
☢️ It’s called **evaluate** because it `eval`s JavaScript.
When possible, please use `compile`, write to a file, and then run with Node,
or use one of the [§ Integrations](#).
But if you trust your content, `evaluate` can work.

`evaluate` wraps code in an [`AsyncFunction`][async-function], `evaluateSync`
uses a normal [`Function`][function].

Typically, `import` (or `export … from`) do not work here.
They can be compiled to dynamic `import()` by passing
[`options.useDynamicImport`][usedynamicimport].

###### `file`

See [`compile`][compile].

###### `options`

Most options are the same as [`compile`][compile], with the following
exceptions:

*   `providerImportSource` is replaced by `useMDXComponents`
*   `jsx*` and `pragma*` options are replaced by `jsx`, `jsxs`, and `Fragment`
*   `outputFormat` is set to `function-body`

###### `options.jsx`

###### `options.jsxs`

###### `options.Fragment`

These three options are required.
They come from an automatic JSX runtime that you must import yourself.

<details>
<summary>Example</summary>

```js
import * as runtime from 'react/jsx-runtime.js'

const {default: Content} = await evaluate('# hi', {...runtime, ...otherOptions})
```

</details>

###### `options.useMDXComponents`

Needed if you want to support a provider.

<details>
<summary>Example</summary>

```js
import * as provider from '@mdx-js/react'
import * as runtime from 'react/jsx-runtime.js'

const {default: Content} = await evaluate('# hi', {...provider, ...runtime, ...otherOptions})
```

</details>

###### Returns

`Promise.<Object>` — Promise that resolves to something that looks a bit like a
module: an object with a `default` field set to the component and anything else
that was exported from the MDX file available too.

<details>
<summary>Example</summary>

Assuming the contents of `example.mdx` from [§ Use][use] was in `file`, then:

```js
import * as runtime from 'react/jsx-runtime.js'
import {evaluate} from '@mdx-js/mdx'

console.log(await evaluate(file, {...runtime}))
```

…yields:

```js
{Thing: [Function: Thing], default: [Function: MDXContent]}
```

</details>

### `evaluateSync(file, options)`

Compile and run MDX.
Synchronous version of [`evaluate`][eval].
When possible please use the async `evaluate`.

### `createProcessor(options)`

Create a unified processor to compile MDX to JS.
Has the same options as [`compile`][compile], but returns a configured
[`processor`](https://github.com/unifiedjs/unified#processor).

Note that `format: 'detect'` does not work here: only `'md'` or `'mdx'` are
allowed (and `'mdx'` is the default).

## Types

This package is fully typed with [TypeScript](https://www.typescriptlang.org).

Additional `CompileOptions`, `EvaluateOptions`, and `ProcessorOptions` types
are exported, which represents acceptable configuration for their respective
methods.

## Security

See [§ Security](#) on our website for information.

## Contribute

See [§ Contribute][contribute] on our website for ways to get started.
See [§ Support][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][] © [Compositor][] and [Vercel][]

[build-badge]: https://github.com/mdx-js/mdx/workflows/main/badge.svg

[build]: https://github.com/mdx-js/mdx/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/mdx-js/mdx/main.svg

[coverage]: https://codecov.io/github/mdx-js/mdx

[downloads-badge]: https://img.shields.io/npm/dm/@mdx-js/mdx.svg

[downloads]: https://www.npmjs.com/package/@mdx-js/mdx

[size-badge]: https://img.shields.io/bundlephobia/minzip/@mdx-js/mdx.svg

[size]: https://bundlephobia.com/result?p=@mdx-js/mdx

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/mdx-js/mdx/discussions

[npm]: https://docs.npjs.com/cli/install

[yarn]: https://classic.yarnpkg.com/docs/cli/add/

[contribute]: https://v2.mdxjs.com/contributing/

[support]: https://v2.mdxjs.com/support/

[coc]: https://github.com/mdx-js/.github/blob/master/code-of-conduct.md

[mit]: https://github.com/mdx-js/mdx/blob/main/packages/mdx/license

[compositor]: https://compositor.io

[vercel]: https://vercel.com

[compile]: #compilefile-options

[eval]: #evaluatefile-options

[buffer]: https://nodejs.org/api/buffer.html

[source-map]: https://github.com/mozilla/source-map

[vfile]: https://github.com/vfile/vfile

[remark-plugins]: https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins

[rehype-plugins]: https://github.com/rehypejs/rehype/blob/main/doc/plugins.md#list-of-plugins

[mdx-syntax]: #

[use]: #use

[outputformat]: #optionsoutputformat

[baseurl]: #optionsbaseurl

[usedynamicimport]: #optionsusedynamicimport

[async-function]: https://developer.mozilla.org/docs/JavaScript/Reference/Global_Objects/AsyncFunction

[function]: https://developer.mozilla.org/docs/JavaScript/Reference/Global_Objects/Function
