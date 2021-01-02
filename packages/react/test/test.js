/* @jsx React.createElement */
/* @jsxFrag React.Fragment */
import path from 'path'
import React from 'react'
import {renderToString} from 'react-dom/server'
import {transformAsync as babelTransform} from '@babel/core'
import mdxTransform from '../../mdx'
import {MDXProvider, useMDXComponents, withMDXComponents} from '../src'

const run = async value => {
  // Turn the serialized MDX code into serialized JSX…
  let doc = await mdxTransform(value, {skipExport: true})

  doc = doc.replace(/import \{.+?\} from "@mdx-js\/react";/g, '')

  // …and that into serialized JS.
  const {code} = await babelTransform(doc, {
    configFile: false,
    plugins: [
      '@babel/plugin-transform-react-jsx',
      path.resolve(__dirname, '../../babel-plugin-remove-export-keywords')
    ]
  })

  // …and finally run it, returning the component.
  // eslint-disable-next-line no-new-func
  return new Function(
    'React',
    '__provideComponents',
    `${code}; return MDXContent`
  )(React, useMDXComponents)
}

describe('@mdx-js/react', () => {
  test('should evaluate MDX code', async () => {
    const Content = await run('# hi')

    expect(renderToString(<Content />)).toEqual('<h1>hi</h1>')
  })

  test('should evaluate some more complex MDX code (text, inline)', async () => {
    const Content = await run(
      '*a* **b** `c` <abbr title="Markdown + JSX">MDX</abbr>'
    )

    expect(renderToString(<Content />)).toEqual(
      '<p><em>a</em> <strong>b</strong> <code>c</code> <abbr title="Markdown + JSX">MDX</abbr></p>'
    )
  })

  test('should evaluate some more complex MDX code (flow, block)', async () => {
    const Content = await run('***\n> * 1. a')

    expect(renderToString(<Content />)).toEqual(
      '<hr/><blockquote><ul><li><ol><li>a</li></ol></li></ul></blockquote>'
    )
  })

  test('should warn on missing components', async () => {
    const Content = await run('<Component>x</Component>')
    const warn = console.warn
    console.warn = jest.fn()

    expect(renderToString(<Content />)).toEqual('<p>x</p>')

    expect(console.warn).toHaveBeenCalledWith(
      'Component `%s` was not imported, exported, or provided by MDXProvider as global scope',
      'Component'
    )

    console.warn = warn
  })

  test('should support components defined in MDX', async () => {
    const Content = await run('export const A = () => <b>!</b>\n\n<A />')

    expect(renderToString(<Content />)).toEqual('<b>!</b>')
  })
})

describe('MDXProvider', () => {
  test('should support `components` with `MDXProvider`', async () => {
    const Content = await run('# hi')

    expect(
      renderToString(
        <MDXProvider
          components={{
            h1: props => <h1 style={{color: 'tomato'}} {...props} />
          }}
        >
          <Content />
        </MDXProvider>
      )
    ).toEqual('<h1 style="color:tomato">hi</h1>')
  })

  test('should support `wrapper` in `components`', async () => {
    const Content = await run('# hi')

    expect(
      renderToString(
        <MDXProvider
          components={{
            wrapper: props => <div id="layout" {...props} />
          }}
        >
          <Content />
        </MDXProvider>
      )
    ).toEqual('<div id="layout"><h1>hi</h1></div>')
  })

  test('should support dots in component names (such as `ol.li`) for a direct child “selector”', async () => {
    const Content = await run('* a\n1. b')

    expect(
      renderToString(
        <MDXProvider
          components={{
            'ol.li': props => <li className="ordered" {...props} />
          }}
        >
          <Content />
        </MDXProvider>
      )
    ).toEqual('<ul><li>a</li></ul><ol><li class="ordered">b</li></ol>')
  })

  test('should combine components in nested `MDXProvider`s', async () => {
    const Content = await run('# hi\n## hello')

    expect(
      renderToString(
        <MDXProvider
          components={{
            h1: props => <h1 style={{color: 'tomato'}} {...props} />,
            h2: props => <h2 style={{color: 'rebeccapurple'}} {...props} />
          }}
        >
          <MDXProvider
            components={{
              h2: props => <h2 style={{color: 'papayawhip'}} {...props} />
            }}
          >
            <Content />
          </MDXProvider>
        </MDXProvider>
      )
    ).toEqual(
      '<h1 style="color:tomato">hi</h1><h2 style="color:papayawhip">hello</h2>'
    )
  })

  test('should support components as a function', async () => {
    const Content = await run('# hi\n## hello')

    expect(
      renderToString(
        <MDXProvider
          components={{
            h1: props => <h1 style={{color: 'tomato'}} {...props} />,
            h2: props => <h2 style={{color: 'rebeccapurple'}} {...props} />
          }}
        >
          <MDXProvider
            components={_outerComponents => ({
              h2: props => <h2 style={{color: 'papayawhip'}} {...props} />
            })}
          >
            <Content />
          </MDXProvider>
        </MDXProvider>
      )
    ).toEqual('<h1>hi</h1><h2 style="color:papayawhip">hello</h2>')
  })

  test('should support a `disableParentContext` prop (sandbox)', async () => {
    const Content = await run('# hi')

    expect(
      renderToString(
        <MDXProvider
          components={{
            h1: props => <h1 style={{color: 'tomato'}} {...props} />
          }}
        >
          <MDXProvider disableParentContext={true}>
            <Content />
          </MDXProvider>
        </MDXProvider>
      )
    ).toEqual('<h1>hi</h1>')
  })
})

describe('withComponents', () => {
  test('should support `withComponents`', async () => {
    const Content = await run('# hi\n## hello')
    const With = withMDXComponents(props => {
      return <>{props.children}</>
    })

    // To do: should this use the `h2` component too?
    expect(
      renderToString(
        <MDXProvider
          components={{
            h1: props => <h1 style={{color: 'tomato'}} {...props} />
          }}
        >
          <With
            components={{
              h2: props => <h2 style={{color: 'papayawhip'}} {...props} />
            }}
          >
            <Content />
          </With>
        </MDXProvider>
      )
    ).toEqual('<h1 style="color:tomato">hi</h1><h2>hello</h2>')
  })
})
