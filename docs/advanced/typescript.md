# TypeScript

<!--
TODO: this feels like it’s placed weirdly.
Where could it go?
-->

Below are some basic typings to get started with:

```tsx
declare module "@mdx-js/react" {
  import { ComponentType, StyleHTMLAttributes } from "react"

  type MDXProps = {
    children: React.ReactNode
    components: { wrapper: React.ReactNode }
  }
  export class MDXProvider extends React.Component<MDXProps> {}
}
```

If you want to improve upon the types we would *love* a PR to
improve the developer experience for TypeScript users.

* * *

If you’re getting errors from TypeScript related to imports with an `*.mdx`
extension, create an `mdx.d.ts` file in your types directory and include it
inside your `tsconfig.json`.

```tsx
// types/mdx.d.ts
declare module '*.mdx' {
  let MDXComponent: (props) => JSX.Element;
  export default MDXComponent;
}
```
