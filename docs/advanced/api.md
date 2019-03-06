# API

MDX core is a transpilation library. It receives and MDX string and outputs a JSX string.

#### Input

```js
# Hello, world!
```

#### Output

```js
const layoutProps = {};
default class MDXContent extends React.Component {
  constructor(props) {
    super(props);
    this.layout = null;
  }
  render() {
    const { components, ...props } = this.props;
    const Layout = this.layout;
    return (
      <div name="wrapper" components={components}>
        <h1>{`a title`}</h1>
        <pre>
          <code parentName="pre" {...{}}>{`and such
`}</code>
        </pre>
        <p>{`testing`}</p>
      </div>
    );
  }
}
MDXContent.isMDXComponent = true;
```