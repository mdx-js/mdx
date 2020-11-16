import regeneratorRuntime from 'regenerator-runtime' // eslint-disable-line no-unused-vars
import {mount} from '@vue/test-utils'
import mdxTransform from '../../mdx'
import {transformAsync as babelTransform} from '@babel/core'
import {MDXProvider, mdx} from '../src'

const run = async value => {
  // Turn the serialized MDX code into serialized JSX…
  const doc = await mdxTransform(value, {skipExport: true})

  // …and that into serialized JS.
  const {code} = await babelTransform(doc, {
    configFile: false,
    plugins: [
      // Here we use react-jsx, which does support a pragma.
      // `vue-loader` tests with `babel-plugin-transform-vue-jsx`.
      '@babel/plugin-transform-react-jsx',
      'babel-plugin-remove-export-keywords'
    ]
  })

  // …and finally run it, returning the component.
  // eslint-disable-next-line no-new-func
  return new Function(
    'unboundMdx',
    `let mdx;
    ${code};

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
        mdx = unboundMdx.bind({ createElement, components: this.components })
        return MDXContent({ components: this.components })
      }
    }`
  )(mdx)
}

describe('@mdx-js/vue', () => {
  test('should evaluate MDX code', async () => {
    const Content = await run('# hi')

    expect(mount(Content).html()).toEqual('<h1>hi</h1>')
  })

  test('should evaluate some more complex MDX code (text, inline)', async () => {
    const Content = await run(
      '*a* **b** `c` <abbr title="Markdown + JSX">MDX</abbr>'
    )

    expect(mount(Content).html()).toEqual(
      '<p><em>a</em> <strong>b</strong> <code>c</code> <abbr title="Markdown + JSX">MDX</abbr></p>'
    )
  })

  test('should evaluate some more complex MDX code (flow, block)', async () => {
    const Content = await run('***\n> a\n* b\n1. c')

    expect(mount(Content).html()).toEqual(
      '<div>\n' +
        '  <hr>\n' +
        '  <blockquote>\n' +
        '    <p>a</p>\n' +
        '    <ul>\n' +
        '      <li>b</li>\n' +
        '    </ul>\n' +
        '    <ol>\n' +
        '      <li>c</li>\n' +
        '    </ol>\n' +
        '  </blockquote>\n' +
        '</div>'
    )
  })

  test('should warn on missing components', async () => {
    const Content = await run('<Component />')
    const warn = console.warn
    console.warn = jest.fn()

    // The literal `undefined` is because the shortcode injected by `mdx-js/mdx`,
    // combined with react-jsx, yields a for Vue unexpected value: a function
    // instead of props.
    expect(mount(Content).html()).toEqual('<div>undefined</div>')

    expect(console.warn).toHaveBeenCalledWith(
      'Component Component was not imported, exported, or provided by MDXProvider as global scope'
    )

    console.warn = warn
  })

  test('should support Vue components defined in MDX', async () => {
    const Content = await run(
      'export const A = {render() { return <b>!</b> }}\n\n<A />'
    )

    expect(mount(Content).html()).toEqual('<b>!</b>')
  })
})

describe('MDXProvider', () => {
  test('should work', async () => {
    const Content = await run('# hi')

    expect(mount(MDXProvider, {slots: {default: [Content]}}).html()).toEqual(
      '<div>\n  <h1>hi</h1>\n</div>'
    )
  })

  test('should support `components`', async () => {
    const Content = await run('*a* and <em id="b">c</em>.')

    expect(
      mount(MDXProvider, {
        slots: {default: [Content]},
        propsData: {
          components: {
            em: {
              name: 'emphasis',
              props: ['id'],
              render: function (h) {
                return h(
                  'i',
                  {attrs: {id: this.id}, style: {fontWeight: 'bold'}},
                  this.$slots.default
                )
              }
            }
          }
        }
      }).html()
    ).toEqual(
      '<div>\n  <p><i style="font-weight: bold;">a</i> and <i id="b" style="font-weight: bold;">c</i>.</p>\n</div>'
    )
  })

  test('should support functional `components`', async () => {
    const Content = await run('*a* and <em id="b">c</em>.')
    const error = console.error
    console.error = jest.fn() // Ignore the warnings that Vue emits.

    expect(
      mount(MDXProvider, {
        slots: {default: [Content]},
        propsData: {
          components: {
            em: function (h) {
              return h('i', {style: {fontWeight: 'bold'}}, this.$slots.default)
            }
          }
        }
      }).html()
    ).toEqual(
      '<div>\n  <p><i style="font-weight: bold;">a</i> and <i style="font-weight: bold;">c</i>.</p>\n</div>'
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

    expect(
      mount(MDXProvider, {
        slots: {default: [Example]},
        propsData: {components}
      }).html()
    ).toEqual(
      '<div>\n  <h1 style="color: tomato;">Hello, world! 2</h1>\n</div>'
    )
  })
})
