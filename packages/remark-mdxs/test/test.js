const mdx = require('../../mdx')
const remarkMdxs = require('..')

const FIXTURE = `
import Foo from './bar'
export const author = 'fred'
export default Foo

# Hello, world! <Foo bar={{ baz: 'qux' }} />

---

<Baz>
  Hi!
</Baz>

---

# I'm another document

over here.
`

it('correctly transpiles', async () => {
  const result = await mdx(FIXTURE, {
    remarkPlugins: [remarkMdxs]
  })

  expect(result).toMatchSnapshot()
})
