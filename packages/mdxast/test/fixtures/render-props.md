<Foo>
  {() => {
    const greet = 'hello'

    return (
      <Bar>
        {() => {
          const name = 'john'

          return (
            <div>{greet} {name}</div>
          )
        }}
      </Bar>
    )
  }}
</Foo>
