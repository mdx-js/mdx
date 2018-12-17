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
  }
]
