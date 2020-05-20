# JSX spans

Many developers like writing markup in Markdown as it often looks more like
what’s intended and it is typically terser. Instead of the following HTML/JSX:

```html
<blockquote>
  <p>A blockquote with <em>some</em> emphasis.</p>
</blockquote>
```

A developer can write:

```markdown
> A blockquote with _some_ emphasis.
```

Markdown is good for **content**.

JSX is typically combined with a frontend framework like React or Vue.
These frameworks add support for components, which let you change repeating
things like the following markup:

```html
<h2>Hello, Venus!</h2>
<h2>Hello, Mars!</h2>
```

…to JSX like this:

```xml
<Welcome name="Venus" />
<Welcome name="Mars" />
```

JSX is good for **components**.
