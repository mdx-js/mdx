# JSX, Markdown, and Code

## Block

### Fenced code

Here is an example of broken JSX:

```jsx
<//>
```

This gets weird when embedded in JSX.
We can’t use character references, because those don’t work in markdown code. 😥

<X>
```jsx
<//>
```
</X>

Or:

<X>
  ```jsx
  <//>
  ```
</X>

Or:

<X>
~~~~~
<//>
~~~~~
</X>

### Indented code

    Not code!

<A>
  <B>
    Nor this!
  </B>
</A>

<A>
  <B>
    <C>
      Nor this, these are all paragraphs.
    </C>
  </B>
</A>

## Span

### Code span

Here is an example of broken JSX: ```<//>```, or here: `{`, and this: `` < ``.

And inside JSX: <>`<//>`</>, or like so: <x>`< and {`</x>.
