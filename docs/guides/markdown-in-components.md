# Markdown in Components

One great feature about MDX is that you can use Markdown within your JSX components.

## Example

Let's say you wanted to create a custom `<Note />` component. You could do something like this.


Using MDX 2:
```.mdx
import Note from './Note'

# Hello from my MDX file.

Here is my `<Note />` component.

<Note>Markdown oh **yeah**!! [Cool, right?](https://www.youtube.com/watch?v=dQw4w9WgXcQ)</Note>
```

The same example, using MDX 1 (notice the need blank lines between the tags and the content):

```.mdx
import Note from './Note'

# Hello from my MDX file.

Here is my `<Note />` component.

<Note>

Markdown oh **yeah**!! [Cool, right?](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

</Note>
```
