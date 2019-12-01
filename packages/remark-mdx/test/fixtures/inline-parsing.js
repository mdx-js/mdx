/* eslint-disable */
module.exports = [
  {
    description: 'Handles object props',
    mdx: 'Hello <span style={{ color: "tomato" }}>world!</span>!'
  },
  {
    description: 'Handles fragments',
    mdx: 'Hello, from <Fragment>{props.from}</Fragment>'
  },
  {
    description: 'Handles components as properties',
    mdx: 'Hello, from <Some.Component>{props.world}</Some.Component>'
  },
  {
    description: 'Ignores escaped JSX',
    mdx: 'This is <span>escaped</span> JSX'
  },
  {
    description: 'Handles fragment shortcut',
    mdx: 'Hello, <>{props.world}</>'
  },
  {
    description: 'Handles declarations as props',
    mdx: 'Hello, <span children={props.world} />'
  },
  {
    description: 'Handles self closing JSX tags',
    mdx: 'Hello, <span children="world" />'
  },
  {
    description: 'Handles self closing JSX tags with object props',
    mdx: 'Hello <span style={{ color: "tomato" }} />'
  },
  {
    description: 'Handles nested tags',
    mdx: 'Hello, <Blue><Code>world <Emoji name="world" /></Code></Blue>'
  },
  {
    description: 'Handles string interpolation',
    mdx: 'Hello, from <span children={`${props.foo}!!!!`} />'
  },
  {
    description: 'Handles functions as props',
    mdx: 'Hello, from <Span children={(some, stuff) => some / stuff} />'
  },
  {
    description: 'Handles functions with returns as props',
    mdx:
      'Hello, from <Span children={(some, stuff) => { return some / stuff }} />'
  },
  {
    description: 'Handles nested object props',
    mdx: 'Hello, from <span some={{ nested: { object: "props" } }} />'
  },
  {
    description: 'Handles multiple inline components with complex JSX',
    mdx:
      'Hello, from <Span children={(some, stuff) => { return some / stuff }} /> <span children={`${props.foo}!!!!`} /> <>{props.world}</>'
  },
  {
    description: 'Does not break } outside of JSX',
    mdx: 'Hello, <Component>{props.world}</Component> and a moustache! }:'
  },
  {
    description: 'Handles links',
    mdx:
      'Hello, <Component>{props.world}</Component> and a moustache! }: <https://johno.com>'
  },
  {
    description: 'Ignores links inside JSX blocks',
    mdx: [
      '# Hello, world!',
      '<Component>from https://johno.com</Component>'
    ].join('\n\n')
  },
  {
    description: 'Handles multiline JSX blocks',
    mdx: `<Image
        src={asset(\`\${SOME_CONSTANT}/some.png\`)}
        width="123"
        height="456"
        caption={
          <span>
            Here's a caption
          </span>
        }
      />
    `.trim()
  }
]
