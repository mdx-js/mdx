import * as mdx from '@mdx-js/mdx'

mdx('# title') // $ExpectType Promise<string>
mdx('# title', {}) // $ExpectType Promise<string>
mdx('# title', {footnotes: false}) // $ExpectType Promise<string>
mdx('# title', {skipExport: false}) // $ExpectType Promise<string>
mdx('# title', {wrapExport: 'React.memo'}) // $ExpectType Promise<string>
mdx('# title', {rehypePlugins: [() => () => ({type: 'test'})]}) // $ExpectType Promise<string>
mdx('# title', {remarkPlugins: [() => () => ({type: 'test'})]}) // $ExpectType Promise<string>
mdx('# title', {compilers: []}) // $ExpectType Promise<string>

mdx.sync('# title') // $ExpectType string
mdx.sync('# title', {}) // $ExpectType string
mdx.sync('# title', {footnotes: false}) // $ExpectType string
mdx.sync('# title', {skipExport: false}) // $ExpectType string
mdx.sync('# title', {wrapExport: 'React.memo'}) // $ExpectType string
mdx.sync('# title', {rehypePlugins: [() => () => ({type: 'test'})]}) // $ExpectType string
mdx.sync('# title', {remarkPlugins: [() => () => ({type: 'test'})]}) // $ExpectType string
mdx.sync('# title', {compilers: []}) // $ExpectType string

mdx.createMdxAstCompiler() // $ExpectType Processor<Settings>
mdx.createMdxAstCompiler({footnotes: false}) // $ExpectType Processor<Settings>
mdx.createMdxAstCompiler({skipExport: false}) // $ExpectType Processor<Settings>
mdx.createMdxAstCompiler({wrapExport: 'React.memo'}) // $ExpectType Processor<Settings>
mdx.createMdxAstCompiler({rehypePlugins: [() => () => ({type: 'test'})]}) // $ExpectType Processor<Settings>
mdx.createMdxAstCompiler({remarkPlugins: [() => () => ({type: 'test'})]}) // $ExpectType Processor<Settings>
mdx.createMdxAstCompiler({compilers: []}) // $ExpectType Processor<Settings>
