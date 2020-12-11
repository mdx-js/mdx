# Expressions in MD + JSX

## Attribute value expression

<X y={`
  // Blank line in attribute

  // …expression.
`}/>

* * *

Can contain more braces: <x y={{z: true}}/>

## Attribute expression

<X {/*stuff!*/...d}/>

* * *

More braces: <x {...{x: '1', z: "zulu"}}/>

## Expression

### Direct

{
  Math.PI
}

* * *

More braces: {{a: 1 + 1}["a"]}.

### Child

<X>
  {
    1 + 1
  }
</X>

* * *

More <>braces: {{a: 1 + 1}["a"]}</>.
