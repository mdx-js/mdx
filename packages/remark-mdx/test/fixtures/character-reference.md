The characters `>` and `}` don’t need to be handled differently: >, }.

> In fact, `>` can start a block quote!

Those characters are also fine in JSX elements: <>> and }</>.

{/* starts an expression, it must be closed: */}

If you don’t want an expression, encode it, like so: &#x7B;.

<starts a="tag, which must be properly closed: "/>

If you don’t want a tag, encode it, like so: &lt;.

Those characters are fine in code: `< and {`.
They’re fine in JSX elements, in code, too: <>`< and {`</>.
Or in block JSX:

<B>
  ```
  < and {
  ```

  ~~~tildes
  < and {
  ~~~

  Inline `code: < and {`.
</B>
