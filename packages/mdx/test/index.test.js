const fs = require('fs')
const path = require('path')
const {select} = require('hast-util-select')
const prism = require('@mapbox/rehype-prism')
const math = require('remark-math')
const katex = require('rehype-katex')
const prettier = require('prettier')
const {parse} = require('@mdx-js/test-util')

const mdx = require('../')

const dropWhitespace = str =>
  str.replace(/\r?\n|\r/g, ' ').replace(/ +(?= )/g, '')

const fixtureBlogPost = fs.readFileSync(
  path.join(__dirname, './fixtures/blog-post.mdx')
)

it('Should output parseable JSX', async () => {
  const result = await mdx('Hello World')

  parse(result)
})

it('Should output parseable JSX when using < or >', async () => {
  const result = await mdx(`
  # Hello, MDX

  I &lt;3 Markdown and JSX
  `)

  parse(result)
})

it('Should compile sample blog post', async () => {
  const result = await mdx(fixtureBlogPost)

  parse(result)
})

it('Should match sample blog post snapshot', async () => {
  const result = await mdx(`# Hello World`)

  expect(prettier.format(result, {parser: 'babel'})).toMatchInlineSnapshot(`
    "/* @jsx mdx */

    const makeShortcode = (name) =>
      function MDXDefaultShortcode(props) {
        console.warn(
          \\"Component \\" +
            name +
            \\" was not imported, exported, or provided by MDXProvider as global scope\\"
        );
        return <div {...props} />;
      };

    const MDXLayout = \\"wrapper\\";
    export default function MDXContent({ components, ...props }) {
      return (
        <MDXLayout {...props} components={components} mdxType=\\"MDXLayout\\">
          <h1>{\`Hello World\`}</h1>
        </MDXLayout>
      );
    }

    MDXContent.isMDXComponent = true;
    "
  `)
})

it('Should render blockquote correctly', async () => {
  const result = await mdx('> test\n\n> `test`')

  parse(result)
})

it('Should properly expose comments', async () => {
  const result = await mdx('{/*foo*/}', {
    rehypePlugins: [
      () => tree => {
        tree.children[0].value = '/*bar*/'
      }
    ]
  })

  expect(prettier.format(result, {parser: 'babel'})).toContain(`{/*bar*/}`)
})

it('Should render HTML inside inlineCode correctly', async () => {
  const result = await mdx('`<div>`')

  expect(result).toContain(
    'inlineCode {...{\n        "parentName": "p"\n      }}>{`<div>`}</inlineCode></p>'
  )
})

it('Should preserve newlines in code blocks', async () => {
  const result = await mdx(
    `
\`\`\`dockerfile
# Add main script
COPY start.sh /home/start.sh
\`\`\`
    `,
    {rehypePlugins: [prism]}
  )

  expect(result).toContain('{`# Add main script`}</span>\n        {`\n`}')
})

it('Should preserve infostring in code blocks', async () => {
  const result = await mdx(
    `
\`\`\`dockerfile exec registry=something.com
# Add main script
COPY start.sh /home/start.sh
\`\`\`
  `
  )

  expect(dropWhitespace(result)).toContain(
    `{...{ "className": "language-dockerfile", "metastring": "exec registry=something.com", "exec": true, "registry": "something.com", "parentName": "pre" }}`
  )
})

it('Should preserve lang className in code blocks', async () => {
  const result = await mdx(
    `
\`\`\`js class=foo
console.log(1)
\`\`\`
    `
  )

  expect(dropWhitespace(result)).toContain(`"className": "language-js foo"`)
})

it('Should support comments', async () => {
  const resultWithWhitespace = await mdx(`
{/* a Markdown comment */}
A paragraph

Some text {/* an inline comment */}

\`\`\`md
{/* a code block string */}
\`\`\`

<div>
  {/* a nested JSX comment */}
</div>

{/* a comment above */}
- list item
{/* a comment below */}

*/} should be as-is

<MyComp content={\`
  {/* a template literal */}
\`}/>
  `)

  const result = dropWhitespace(resultWithWhitespace)
  expect(result).toContain('{ /* a Markdown comment */ }')
  expect(result).toContain('{ /* an inline comment */ }')
  expect(result).toContain('{/* a code block string */}')
  expect(result).toContain('{ /* a nested JSX comment */ }')
  expect(result).toContain('{ /* a comment above */ }')
  expect(result).toContain('{ /* a comment below */ }')
  expect(result).toContain('*/} should be as-is')
  expect(result).toContain('{/* a template literal */}')
})

test('Should not forward MDX options to plugins', async () => {
  expect.assertions(2)
  await mdx(``, {
    remarkPlugins: [
      options => _tree => {
        expect(options).toMatchInlineSnapshot(`undefined`)
      }
    ],
    rehypePlugins: [
      options => _tree => {
        expect(options).toMatchInlineSnapshot(`undefined`)
      }
    ]
  })
})

it('Should convert style strings to camelized objects', async () => {
  const result = await mdx(
    `
$$
\\sum{1}
$$
  `,
    {
      remarkPlugins: [math],
      rehypePlugins: [katex]
    }
  )
  expect(result).not.toContain('"style":"')
  expect(dropWhitespace(result)).toContain('"style": {')
})

it('Should convert data-* and aria-* properties to param-case', async () => {
  const result = await mdx(
    `
$$
\\sum{1}
$$
  `,
    {
      remarkPlugins: [math],
      rehypePlugins: [katex]
    }
  )
  expect(dropWhitespace(result)).toContain('"aria-hidden": "true"')
})

it('Should support multiline default export statement', async () => {
  const result = await mdx(`export default ({ children }) => (
  <Layout>
    {children}
  </Layout>
)`)
  expect(() => parse(result)).not.toThrow()
})

it('Should support semicolons in default export statement', async () => {
  const result = await mdx(`export default Layout;`)
  expect(() => parse(result)).not.toThrow()
})

it('Should not include export wrapper if skipExport is true', async () => {
  const result = await mdx('> test\n\n> `test`', {skipExport: true})

  expect(result).not.toContain('export default ({components, ...props}) =>')
})

it('Should recognize components as properties', async () => {
  const result = await mdx('# Hello\n\n<MDX.Foo />')
  expect(dropWhitespace(result)).toContain('<h1>{`Hello`}</h1> <MDX.Foo />')
})

it('Should contain static isMDXComponent() function', async () => {
  const result = await mdx('# Hello World')
  expect(result).toContain('MDXContent.isMDXComponent = true')
})

it('Should render elements without wrapping blank new lines', async () => {
  const result = await mdx(`
  | Test | Table |
  | :--- | :---- |
  | Col1 | Col2  |`)

  expect(result).not.toContain('{`\n`}')
})

it('Should wrap export function when wrapExport is provided', async () => {
  const result = await mdx(`# Test`, {
    wrapExport: 'React.memo'
  })

  expect(result).toContain(`export default React.memo(MDXContent)`)
})

test('Should await and render async plugins', async () => {
  const result = await mdx(fixtureBlogPost, {
    rehypePlugins: [
      _options => tree =>
        (async () => {
          const headingNode = select('h1', tree)
          const textNode = headingNode.children[0]
          textNode.value = textNode.value.toUpperCase()
        })()
    ]
  })

  expect(result).toMatch(/HELLO, WORLD!/)
})

test('Should process filepath and pass it to the plugins', async () => {
  const result = await mdx(fixtureBlogPost, {
    filepath: 'hello.mdx',
    rehypePlugins: [
      _options => (tree, fileInfo) => {
        expect(fileInfo.path).toBe('hello.mdx')
        const headingNode = select('h1', tree)
        const textNode = headingNode.children[0]
        textNode.value = textNode.value.toUpperCase()
      }
    ]
  })

  expect(result).toMatch(/HELLO, WORLD!/)
})

test('Should parse and render footnotes', async () => {
  const result = await mdx(
    'This is a paragraph with a [^footnote]\n\n[^footnote]: Here is the footnote'
  )

  expect(dropWhitespace(result)).toContain(
    '<sup {...{ "id": "fnref-footnote", "parentName": "p" }}>'
  )

  expect(dropWhitespace(result)).toContain(
    '<li {...{ "id": "fn-footnote", "parentName": "ol" }}>'
  )
}, 10000)

test('Should expose a sync compiler', () => {
  const result = mdx.sync(fixtureBlogPost)

  expect(result).toMatch(/Hello, world!/)
})

test('Should handle layout props', () => {
  const result = mdx.sync(fixtureBlogPost)

  expect(result).toMatchInlineSnapshot(`
    "/* @jsx mdx */
    import { Baz } from './Fixture'
    import { Buz } from './Fixture'
    export const foo = {
      hi: \`Fudge \${Baz.displayName || 'Baz'}\`,
      authors: ['fred', 'sally']
    };
    const makeShortcode = name => function MDXDefaultShortcode(props) {
      console.warn(\\"Component \\" + name + \\" was not imported, exported, or provided by MDXProvider as global scope\\")
      return <div {...props}/>
    };
    const Foo = makeShortcode(\\"Foo\\");
    const Bar = makeShortcode(\\"Bar\\");
    const MDXLayout = ({children}) => <div>{children}</div>
    export default function MDXContent({
      components,
      ...props
    }) {
      return <MDXLayout {...props} components={components} mdxType=\\"MDXLayout\\">
        <h1>{\`Hello, world!\`}</h1>
        <p>{\`I'm an awesome paragraph.\`}</p>
        {
          /* I'm a comment */
        }
        <Foo bg=\\"red\\" mdxType=\\"Foo\\">
          <Bar mdxType=\\"Bar\\">
            <p>{\`hi\`}</p>
          </Bar>
          {hello}
          {
            /* another commment */
          }
        </Foo>
        <pre><code {...{
            \\"parentName\\": \\"pre\\"
          }}>{\`test codeblock
    \`}</code></pre>
        <pre><code {...{
            \\"className\\": \\"language-js\\",
            \\"parentName\\": \\"pre\\"
          }}>{\`module.exports = 'test'
    \`}</code></pre>
        <pre><code {...{
            \\"className\\": \\"language-sh\\",
            \\"parentName\\": \\"pre\\"
          }}>{\`npm i -g foo
    \`}</code></pre>
        <table>

          <thead {...{
            \\"parentName\\": \\"table\\"
          }}>

            <tr {...{
              \\"parentName\\": \\"thead\\"
            }}>

              <th {...{
                \\"align\\": \\"left\\",
                \\"parentName\\": \\"tr\\"
              }}>{\`Test\`}</th>


              <th {...{
                \\"align\\": \\"left\\",
                \\"parentName\\": \\"tr\\"
              }}>{\`Table\`}</th>

            </tr>

          </thead>


          <tbody {...{
            \\"parentName\\": \\"table\\"
          }}>

            <tr {...{
              \\"parentName\\": \\"tbody\\"
            }}>

              <td {...{
                \\"align\\": \\"left\\",
                \\"parentName\\": \\"tr\\"
              }}>{\`Col1\`}</td>


              <td {...{
                \\"align\\": \\"left\\",
                \\"parentName\\": \\"tr\\"
              }}>{\`Col2\`}</td>

            </tr>

          </tbody>

        </table>

        <pre><code {...{
            \\"className\\": \\"language-js\\",
            \\"parentName\\": \\"pre\\"
          }}>{\`export const Button = styled.button\\\\\`
      font-size: 1rem;
      border-radius: 5px;
      padding: 0.25rem 1rem;
      margin: 0 1rem;
      background: transparent;
      color: \\\\\${props => props.theme.primary};
      border: 2px solid \\\\\${props => props.theme.primary};
      \\\\\${props =>
        props.primary &&
        css\\\\\`
          background: \\\\\${props => props.theme.primary};
          color: white;
        \\\\\`};
    \\\\\`
    \`}</code></pre>
      </MDXLayout>;
    }

    ;
    MDXContent.isMDXComponent = true;"
  `)
})
