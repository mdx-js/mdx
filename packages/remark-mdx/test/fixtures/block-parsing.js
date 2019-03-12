/* eslint-disable */
module.exports = [
  {
    description: 'Handles a basic div',
    mdx: '<div>hi</div>'
  },
  {
    description: 'Handles a basic div with empty newlines',
    mdx: `<div>
    
hi

</div>`
  },
  {
    description: 'Render props with a new line',
    mdx: `<Component>
    {thing => {
      const foo = thing()

      return (
        <Bar>{foo}</Bar>
      )
    }}
    </Component>`
  }
]
