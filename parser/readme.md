# [WIP] MDX Parser

Proof of concept of an MDX parser to create an MDXAST.

## Limitations

I was hoping to use `babylon` to handle the majority of the JSX parsing, however I don't think this will end up working since it will attempt to parse embedded markdown which uses the `<markdown>` syntax.

Consider the following scenario of a `{` in markdown:

```jsx
# Hello,

<ul>
<markdown>
* this will break {
* and {this will break}
* <this too>
</markdown>
</ul>
```
