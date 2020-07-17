/* @jsx mdx */
import {mdx} from '../src'

const Component = ({components}) => <p>{Object.keys(components).join(', ')}</p>

export default () => (
  <wrapper>
    <h1 />
    <h2 />
    <del />
    <Component
      components={{
        h3: props => <h3 {...props} />,
        h4: props => <h4 {...props} />
      }}
    />
  </wrapper>
)
