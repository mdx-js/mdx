# TypeScript

If you're getting errors from TypeScript related to imports with an `*.mdx` extension, create an `mdx.d.ts` file in your types directory and include inside your `tsconfig.json`

```
// types/mdx.d.ts
declare module '*.mdx' {
  let MDXComponent: (props) => JSX.Element;
  export default MDXComponent;
}
```
