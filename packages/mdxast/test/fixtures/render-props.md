import { Foo } from './Foo'
import { Bar } from './Bar'

# Some test

<Foo>
  {() => (
    <div>helo</div>
  )}
</Foo>

<Bar>
  <Foo>
    {() => {
      const message = 'helo'

      return (
        <div>{message}</div>
      )
    }}
  </Foo>
</Bar>

<Bar>
  <Foo>
    {() => {
      const message = 'helo'

      return (
        <Foo>
          {() => {
            const name = 'john'

            return (
              <div>{message} {john}</div>
            )
          }}
        </Foo>
      )
    }}
  </Foo>
</Bar>
