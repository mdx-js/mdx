require('jsdom-global')()

const path = require('path')
const {test} = require('uvu')
const assert = require('uvu/assert')
const {mount} = require('@vue/test-utils')
const mdxTransform = require('../../mdx')
const vueMergeProps = require('babel-helper-vue-jsx-merge-props')
const {transformAsync: babelTransform} = require('@babel/core')
const {MDXProvider, mdx} = require('../src')

const run = async value => {
  // Turn the serialized MDX code into serialized JSX…
  const doc = await mdxTransform(value, {skipExport: true, mdxFragment: false})

  // …and that into serialized JS.
  const {code} = await babelTransform(doc, {
    configFile: false,
    plugins: [
      'babel-plugin-transform-vue-jsx',
      path.resolve(__dirname, '../../babel-plugin-remove-export-keywords')
    ]
  })

  // …and finally run it, returning the component.
  // eslint-disable-next-line no-new-func
  return new Function(
    'mdx',
    '_mergeJSXProps',
    `let h;
    ${code.replace(
      /import _mergeJSXProps from "babel-helper-vue-jsx-merge-props";/,
      ''
    )};

    return {
      name: 'Mdx',
      inject: {
        $mdxComponents: {
          default: () => () => ({})
        }
      },
      computed: {
        components() {
          return this.$mdxComponents()
        }
      },
      render(createElement) {
        h = mdx.bind({createElement, components: this.components})
        return MDXContent({components: this.components})
      }
    }`
  )(mdx, vueMergeProps)
}

test('should evaluate MDX code', async () => {
  const Content = await run('# hi')

  assert.equal(mount(Content).html(), '<h1>hi</h1>')
})

test('should evaluate some more complex MDX code (text, inline)', async () => {
  const Content = await run(
    '*a* **b** `c` <abbr title="Markdown + JSX">MDX</abbr>'
  )

  assert.equal(
    mount(Content).html(),
    '<p><em>a</em> <strong>b</strong> <code>c</code> <abbr title="Markdown + JSX">MDX</abbr></p>'
  )
})

test('should evaluate some more complex MDX code (flow, block)', async () => {
  const Content = await run('***\n> a\n* b\n1. c')

  assert.equal(
    mount(Content).html(),
    '<div>\n' +
      '  <hr>\n' +
      '  <blockquote>\n' +
      '    <p>a</p>\n' +
      '  </blockquote>\n' +
      '  <ul>\n' +
      '    <li>b</li>\n' +
      '  </ul>\n' +
      '  <ol>\n' +
      '    <li>c</li>\n' +
      '  </ol>\n' +
      '</div>'
  )
})

test('should warn on missing components', async () => {
  const Content = await run('<Component />')
  const {warn} = console
  const calls = []
  console.warn = (...parameters) => {
    calls.push(parameters)
  }

  assert.equal(mount(Content).html(), '<div></div>')

  assert.equal(calls, [
    [
      'Component `%s` was not imported, exported, or provided by MDXProvider as global scope',
      'Component'
    ]
  ])

  console.warn = warn
})

test('should support Vue components defined in MDX', async () => {
  const Content = await run(
    'export const A = {render() { return <b>!</b> }}\n\n<A />'
  )

  assert.equal(mount(Content).html(), '<b>!</b>')
})

test('should work', async () => {
  const Content = await run('# hi')

  assert.equal(
    mount(MDXProvider, {slots: {default: [Content]}}).html(),
    '<div>\n  <h1>hi</h1>\n</div>'
  )
})

test('should support `components`', async () => {
  const Content = await run('*a* and <em id="b">c</em>.')

  assert.equal(
    mount(MDXProvider, {
      slots: {default: [Content]},
      propsData: {
        components: {
          em: {
            name: 'emphasis',
            props: ['id'],
            render(h) {
              return h(
                'i',
                {attrs: {id: this.id}, style: {fontWeight: 'bold'}},
                this.$slots.default
              )
            }
          }
        }
      }
    }).html(),
    '<div>\n  <p><i style="font-weight: bold;">a</i> and <i id="b" style="font-weight: bold;">c</i>.</p>\n</div>'
  )
})

test('should support functional `components`', async () => {
  const Content = await run('*a* and <em id="b">c</em>.')
  const {error} = console
  console.error = () => {}

  assert.equal(
    mount(MDXProvider, {
      slots: {default: [Content]},
      propsData: {
        components: {
          em(h) {
            return h('i', {style: {fontWeight: 'bold'}}, this.$slots.default)
          }
        }
      }
    }).html(),
    '<div>\n  <p><i style="font-weight: bold;">a</i> and <i style="font-weight: bold;" id="b">c</i>.</p>\n</div>'
  )

  console.error = error
})

test('should support the readme example', async () => {
  const Example = await run('# Hello, world! {1 + 1}')

  const components = {
    h1: {
      render(h) {
        return h('h1', {style: {color: 'tomato'}}, this.$slots.default)
      }
    }
  }

  assert.equal(
    mount(MDXProvider, {
      slots: {default: [Example]},
      propsData: {components}
    }).html(),
    '<div>\n  <h1 style="color: tomato;">Hello, world! 2</h1>\n</div>'
  )
})

test.run()
