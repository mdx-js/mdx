'use strict'

let fs = require('fs')
let path = require('path')
let test = require('tape')
let u = require('unist-builder')
let vfile = require('to-vfile')
let unified = require('unified')
let parse = require('remark-parse')
let stringify = require('remark-stringify')
let remove = require('unist-util-remove-position')
let visit = require('unist-util-visit')
let mdx = require('..')

let base = path.join(__dirname, 'fixtures')

test('parse', function (t) {
  let basic = unified().use(parse).use(mdx)

  t.test('MDX vs. MDX.js', function (t) {
    t.deepEqual(
      clean(
        unified().use(parse).use(mdx, {js: false}).parse('{1 + /* } */ 2}')
          .children[0]
      ),
      u('paragraph', [u('mdxTextExpression', '1 + /* '), u('text', ' */ 2}')]),
      'should count braces in agnostic mode (`js: false`)'
    )

    t.deepEqual(
      clean(unified().use(parse).use(mdx).parse('{1 + /* } */ 2}').children[0]),
      u('mdxFlowExpression', {data: {estree: null}}, '1 + /* } */ 2'),
      'should parse expressions in gnostic mode (default)'
    )

    t.end()
  })

  t.test('basics', function (t) {
    t.deepEqual(
      clean(basic.parse('Alpha <b/> charlie.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: 'b', attributes: []}, []),
          u('text', ' charlie.')
        ])
      ]),
      'should parse a self-closing tag'
    )

    t.deepEqual(
      clean(basic.parse('Alpha <b></b> charlie.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: 'b', attributes: []}, []),
          u('text', ' charlie.')
        ])
      ]),
      'should parse an opening and a closing tag'
    )

    t.deepEqual(
      clean(basic.parse('Alpha <></> charlie.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: null, attributes: []}, []),
          u('text', ' charlie.')
        ])
      ]),
      'should parse fragments'
    )

    t.deepEqual(
      clean(basic.parse('Alpha <b>*bravo*</b> charlie.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: 'b', attributes: []}, [
            u('emphasis', [u('text', 'bravo')])
          ]),
          u('text', ' charlie.')
        ])
      ]),
      'should parse markdown inside tags'
    )

    t.deepEqual(
      clean(basic.parse('Alpha {1 + 1} charlie.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxTextExpression', {data: {estree: null}}, '1 + 1'),
          u('text', ' charlie.')
        ])
      ]),
      'should parse expressions'
    )

    t.end()
  })

  t.test('complete', function (t) {
    t.throws(
      function () {
        basic.parse('Alpha <b> charlie.')
      },
      /Cannot close `paragraph` \(1:1-1:19\): a different token \(`mdxJsxTextTag`, 1:7-1:10\) is open/,
      'should crash on an unclosed element'
    )

    t.throws(
      function () {
        basic.parse('Alpha <> charlie.')
      },
      /Cannot close `paragraph` \(1:1-1:18\): a different token \(`mdxJsxTextTag`, 1:7-1:9\) is open/,
      'should crash on an unclosed fragment'
    )

    t.deepEqual(
      clean(basic.parse('Alpha < \t>bravo</>.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: null, attributes: []}, [
            u('text', 'bravo')
          ]),
          u('text', '.')
        ])
      ]),
      'should parse whitespace in the opening tag (fragment)'
    )

    t.deepEqual(
      clean(basic.parse('Alpha < \nb\t>bravo</b>.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: 'b', attributes: []}, [
            u('text', 'bravo')
          ]),
          u('text', '.')
        ])
      ]),
      'should parse whitespace in the opening tag (element)'
    )

    t.throws(
      function () {
        basic.parse('Alpha <!> charlie.')
      },
      /Unexpected character `!` \(U\+0021\) before name, expected a character that can start a name, such as a letter, `\$`, or `_`/,
      'should crash on a nonconforming start identifier'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a></(> charlie.')
      },
      /Unexpected character `\(` \(U\+0028\) before name, expected a character that can start a name, such as a letter, `\$`, or `_`/,
      'should crash on a nonconforming start identifier in a closing tag'
    )

    t.deepEqual(
      clean(basic.parse('Alpha <π /> bravo.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: 'π', attributes: []}, []),
          u('text', ' bravo.')
        ])
      ]),
      'should parse non-ascii identifier start characters'
    )

    t.throws(
      function () {
        basic.parse('Alpha <© /> bravo.')
      },
      /Unexpected character `©` \(U\+00A9\) before name, expected a character that can start a name, such as a letter, `\$`, or `_`/,
      'should crash on non-conforming non-ascii identifier start characters'
    )

    t.deepEqual(
      clean(basic.parse('Alpha <a\u200cb /> bravo.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: 'a\u200cb', attributes: []}, []),
          u('text', ' bravo.')
        ])
      ]),
      'should parse non-ascii identifier continuation characters'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a¬ /> bravo.')
      },
      /Unexpected character `¬` \(U\+00AC\) in name, expected a name character such as letters, digits, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on non-conforming non-ascii identifier continuation characters'
    )

    t.deepEqual(
      clean(basic.parse('Alpha <a-->bravo</a-->.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: 'a--', attributes: []}, [
            u('text', 'bravo')
          ]),
          u('text', '.')
        ])
      ]),
      'should parse dashes in names'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a?> charlie.')
      },
      /Unexpected character `\?` \(U\+003F\) in name, expected a name character such as letters, digits, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming identifier continuation characters'
    )

    t.deepEqual(
      clean(basic.parse('Alpha <abc . def.ghi>bravo</abc.def . ghi>.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: 'abc.def.ghi', attributes: []}, [
            u('text', 'bravo')
          ]),
          u('text', '.')
        ])
      ]),
      'should parse dots in names for method names'
    )

    t.deepEqual(
      clean(basic.parse('Alpha <svg: rect>bravo</  svg :rect>.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: 'svg:rect', attributes: []}, [
            u('text', 'bravo')
          ]),
          u('text', '.')
        ])
      ]),
      'should parse colons in names for local names'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a:+> charlie.')
      },
      /Unexpected character `\+` \(U\+002B\) before local name, expected a character that can start a name, such as a letter, `\$`, or `_`/,
      'should crash on a nonconforming character to start a local name'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a:b|> charlie.')
      },
      /Unexpected character `\|` \(U\+007C\) in local name, expected a name character such as letters, digits, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character in a local name'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a..> charlie.')
      },
      /Unexpected character `\.` \(U\+002E\) before member name, expected a character that can start an attribute name, such as a letter, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character to start a member name'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a.b,> charlie.')
      },
      /Unexpected character `,` \(U\+002C\) in member name, expected a name character such as letters, digits, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character in a member name'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a:b .> charlie.')
      },
      /Unexpected character `\.` \(U\+002E\) after local name, expected a character that can start an attribute name, such as a letter, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character after a local name'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a.b :> charlie.')
      },
      /Unexpected character `:` \(U\+003A\) after member name, expected a character that can start an attribute name, such as a letter, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character after a member name'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a => charlie.')
      },
      /Unexpected character `=` \(U\+003D\) after name, expected a character that can start an attribute name, such as a letter, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character after name'
    )

    t.deepEqual(
      clean(basic.parse('Alpha <b {...props} {...rest}>charlie</b>.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u(
            'mdxJsxTextElement',
            {
              name: 'b',
              attributes: [
                u(
                  'mdxJsxExpressionAttribute',
                  {data: {estree: null}},
                  '...props'
                ),
                u(
                  'mdxJsxExpressionAttribute',
                  {data: {estree: null}},
                  '...rest'
                )
              ]
            },
            [u('text', 'charlie')]
          ),
          u('text', '.')
        ])
      ]),
      'should parse attribute expressions'
    )

    t.deepEqual(
      clean(basic.parse('<a{...b}/>.')),
      u('root', [
        u('paragraph', [
          u(
            'mdxJsxTextElement',
            {
              name: 'a',
              attributes: [
                u('mdxJsxExpressionAttribute', {data: {estree: null}}, '...b')
              ]
            },
            []
          ),
          u('text', '.')
        ])
      ]),
      'should parse attribute expressions directly after a name'
    )

    t.deepEqual(
      clean(basic.parse('<a.b{...c}/>.')),
      u('root', [
        u('paragraph', [
          u(
            'mdxJsxTextElement',
            {
              name: 'a.b',
              attributes: [
                u('mdxJsxExpressionAttribute', {data: {estree: null}}, '...c')
              ]
            },
            []
          ),
          u('text', '.')
        ])
      ]),
      'should parse attribute expressions directly after a member name'
    )

    t.deepEqual(
      clean(basic.parse('<a:b{...c}/>.')),
      u('root', [
        u('paragraph', [
          u(
            'mdxJsxTextElement',
            {
              name: 'a:b',
              attributes: [
                u('mdxJsxExpressionAttribute', {data: {estree: null}}, '...c')
              ]
            },
            []
          ),
          u('text', '.')
        ])
      ]),
      'should parse attribute expressions directly after a local name'
    )

    t.deepEqual(
      clean(basic.parse('Alpha <b c{...d}/>.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u(
            'mdxJsxTextElement',
            {
              name: 'b',
              attributes: [
                u('mdxJsxAttribute', {name: 'c', value: null}),
                u('mdxJsxExpressionAttribute', {data: {estree: null}}, '...d')
              ]
            },
            []
          ),
          u('text', '.')
        ])
      ]),
      'should parse attribute expression directly after boolean attributes'
    )

    t.deepEqual(
      clean(basic.parse('Alpha <b c:d{...e}/>.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u(
            'mdxJsxTextElement',
            {
              name: 'b',
              attributes: [
                u('mdxJsxAttribute', {name: 'c:d', value: null}),
                u('mdxJsxExpressionAttribute', {data: {estree: null}}, '...e')
              ]
            },
            []
          ),
          u('text', '.')
        ])
      ]),
      'should parse attribute expression directly after boolean qualified attributes'
    )

    t.deepEqual(
      clean(basic.parse('Alpha <b alpha {...props} bravo>charlie</b>.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u(
            'mdxJsxTextElement',
            {
              name: 'b',
              attributes: [
                u('mdxJsxAttribute', {name: 'alpha', value: null}),
                u(
                  'mdxJsxExpressionAttribute',
                  {data: {estree: null}},
                  '...props'
                ),
                u('mdxJsxAttribute', {name: 'bravo', value: null})
              ]
            },
            [u('text', 'charlie')]
          ),
          u('text', '.')
        ])
      ]),
      'should parse attribute expressions and normal attributes'
    )

    t.deepEqual(
      clean(
        basic.parse('Alpha <b c     d="d"\t\tefg=\'e\'>charlie</b>.'),
        true
      ),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u(
            'mdxJsxTextElement',
            {
              name: 'b',
              attributes: [
                u('mdxJsxAttribute', {name: 'c', value: null}),
                u('mdxJsxAttribute', {name: 'd'}, 'd'),
                u('mdxJsxAttribute', {name: 'efg'}, 'e')
              ]
            },
            [u('text', 'charlie')]
          ),
          u('text', '.')
        ])
      ]),
      'should parse attributes'
    )

    t.throws(
      function () {
        basic.parse('Alpha <b {...p}~>charlie</b>.')
      },
      /Unexpected character `~` \(U\+007E\) before attribute name, expected a character that can start an attribute name, such as a letter, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character before an attribute name'
    )

    t.throws(
      function () {
        basic.parse('Alpha <b {...')
      },
      /Unexpected end of file in expression, expected a corresponding closing brace for `{`/,
      'should crash on a missing closing brace in attribute expression'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a b@> charlie.')
      },
      /Unexpected character `@` \(U\+0040\) in attribute name, expected an attribute name character such as letters, digits, `\$`, or `_`; `=` to initialize a value; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character in attribute name'
    )

    t.deepEqual(
      clean(
        basic.parse('Alpha <b xml :\tlang\n= "de-CH" foo:bar>charlie</b>.'),
        true
      ),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u(
            'mdxJsxTextElement',
            {
              name: 'b',
              attributes: [
                u('mdxJsxAttribute', {name: 'xml:lang'}, 'de-CH'),
                u('mdxJsxAttribute', {name: 'foo:bar', value: null})
              ]
            },
            [u('text', 'charlie')]
          ),
          u('text', '.')
        ])
      ]),
      'should parse prefixed attributes'
    )

    t.deepEqual(
      clean(basic.parse('Alpha <b a b : c d : e = "f" g/>.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u(
            'mdxJsxTextElement',
            {
              name: 'b',
              attributes: [
                u('mdxJsxAttribute', {name: 'a', value: null}),
                u('mdxJsxAttribute', {name: 'b:c', value: null}),
                u('mdxJsxAttribute', {name: 'd:e'}, 'f'),
                u('mdxJsxAttribute', {name: 'g', value: null})
              ]
            },
            []
          ),
          u('text', '.')
        ])
      ]),
      'should parse prefixed and normal attributes'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a b 1> charlie.')
      },
      /Unexpected character `1` \(U\+0031\) after attribute name, expected a character that can start an attribute name, such as a letter, `\$`, or `_`; `=` to initialize a value; or the end of the tag/,
      'should crash on a nonconforming character after an attribute name'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a b:#> charlie.')
      },
      /Unexpected character `#` \(U\+0023\) before local attribute name, expected a character that can start an attribute name, such as a letter, `\$`, or `_`/,
      'should crash on a nonconforming character to start a local attribute name'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a b:c%> charlie.')
      },
      /Unexpected character `%` \(U\+0025\) in local attribute name, expected an attribute name character such as letters, digits, `\$`, or `_`; `=` to initialize a value; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character in a local attribute name'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a b:c ^> charlie.')
      },
      /Unexpected character `\^` \(U\+005E\) after local attribute name, expected a character that can start an attribute name, such as a letter, `\$`, or `_`; `=` to initialize a value; or the end of the tag/,
      'should crash on a nonconforming character after a local attribute name'
    )

    t.deepEqual(
      clean(basic.parse('Alpha <b c={1 + 1}>charlie</b>.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u(
            'mdxJsxTextElement',
            {
              name: 'b',
              attributes: [
                u('mdxJsxAttribute', {
                  name: 'c',
                  value: u(
                    'mdxJsxAttributeValueExpression',
                    {data: {estree: null}},
                    '1 + 1'
                  )
                })
              ]
            },
            [u('text', 'charlie')]
          ),
          u('text', '.')
        ])
      ]),
      'should parse attribute value expressions'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a b=``> charlie.')
      },
      /Unexpected character `` ` `` \(U\+0060\) before attribute value, expected a character that can start an attribute value, such as `"`, `'`, or `{`/,
      'should crash on a nonconforming character before an attribute value'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a b="> charlie.')
      },
      /Unexpected end of file in attribute value, expected a corresponding closing quote `"`/,
      'should crash on a missing closing quote in double quoted attribute value'
    )

    t.throws(
      function () {
        basic.parse("Alpha <a b='> charlie.")
      },
      /Unexpected end of file in attribute value, expected a corresponding closing quote `'`/,
      'should crash on a missing closing quote in single quoted attribute value'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a b={> charlie.')
      },
      /Unexpected end of file in expression, expected a corresponding closing brace for `{`/,
      'should crash on a missing closing brace in an attribute value expression'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a b=""*> charlie.')
      },
      /Unexpected character `\*` \(U\+002A\) before attribute name, expected a character that can start an attribute name, such as a letter, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character after an attribute value'
    )

    t.deepEqual(
      clean(basic.parse('<a b=""c/>.')),
      u('root', [
        u('paragraph', [
          u(
            'mdxJsxTextElement',
            {
              name: 'a',
              attributes: [
                u('mdxJsxAttribute', {name: 'b'}, ''),
                u('mdxJsxAttribute', {name: 'c', value: null})
              ]
            },
            []
          ),
          u('text', '.')
        ])
      ]),
      'should parse an attribute directly after a value'
    )

    t.deepEqual(
      clean(basic.parse('<a{...b}c/>.')),
      u('root', [
        u('paragraph', [
          u(
            'mdxJsxTextElement',
            {
              name: 'a',
              attributes: [
                u('mdxJsxExpressionAttribute', {data: {estree: null}}, '...b'),
                u('mdxJsxAttribute', {name: 'c', value: null})
              ]
            },
            []
          ),
          u('text', '.')
        ])
      ]),
      'should parse an attribute directly after an attribute expression'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a/b> charlie.')
      },
      /Unexpected character `b` \(U\+0062\) after self-closing slash, expected `>` to end the tag/,
      'should crash on a nonconforming character after a self-closing slash'
    )

    t.deepEqual(
      clean(basic.parse('<a/ \t>.')),
      u('root', [
        u('paragraph', [
          u('mdxJsxTextElement', {name: 'a', attributes: []}, []),
          u('text', '.')
        ])
      ]),
      'should parse whitespace directly after closing slash'
    )

    t.throws(
      function () {
        basic.parse('Alpha {1 + 1 charlie.')
      },
      /Unexpected end of file in expression, expected a corresponding closing brace for `{`/,
      'should crash on a missing closing brace in expression'
    )

    t.doesNotThrow(function () {
      basic.parse('Alpha } charlie.')
    }, 'should *not* crash on closing curly in text')

    t.doesNotThrow(function () {
      basic.parse('Alpha > charlie.')
    }, 'should *not* crash on closing angle in text')

    t.doesNotThrow(function () {
      basic.parse('Alpha <>`<`</> charlie.')
    }, 'should *not* crash on opening angle in tick code in an element')

    t.doesNotThrow(function () {
      basic.parse('Alpha <>`{`</> charlie.')
    }, 'should *not* crash on opening curly in tick code in an element')

    t.doesNotThrow(function () {
      basic.parse('<>\n```\n<\n```\n</>')
    }, 'should *not* crash on opening angle in tick block code in an element')

    t.doesNotThrow(function () {
      basic.parse('<>\n```\n{\n```\n</>')
    }, 'should *not* crash on opening curly in tick block code in an element')

    t.doesNotThrow(function () {
      basic.parse('<>\n~~~\n<\n~~~\n</>')
    }, 'should *not* crash on opening angle in tilde block code in an element')

    t.doesNotThrow(function () {
      basic.parse('<>\n~~~\n{\n~~~\n</>')
    }, 'should *not* crash on opening curly in tilde block code in an element')

    t.doesNotThrow(function () {
      basic.parse('Alpha <>`` ``` ``</>')
    }, 'should *not* crash on ticks in tick code in an element')

    t.doesNotThrow(function () {
      basic.parse('Alpha <>~~ ~~~ ~~</>')
    }, 'should *not* crash on tildes in tilde code in an element')

    t.doesNotThrow(function () {
      basic.parse('Alpha <>`</>')
    }, 'should *not* crash on unclosed tick code')

    t.throws(
      function () {
        basic.parse('<>\n~~~')
      },
      /Cannot close document, a token \(`mdxJsxFlowTag`, 1:1-1:3\) is still open/,
      'should crash on unclosed flow after unclosed tilde code'
    )

    t.throws(
      function () {
        basic.parse('Alpha </> charlie.')
      },
      /Unexpected closing slash `\/` in tag, expected an open tag first/,
      'should crash on closing tag without open elements'
    )

    t.throws(
      function () {
        basic.parse('Alpha <></b> charlie.')
      },
      /Unexpected closing tag `<\/b>`, expected corresponding closing tag for `<>` \(1:7-1:9\)/,
      'should crash on mismatched tags (1)'
    )
    t.throws(
      function () {
        basic.parse('Alpha <b></> charlie.')
      },
      /Unexpected closing tag `<\/>`, expected corresponding closing tag for `<b>` \(1:7-1:10\)/,
      'should crash on mismatched tags (2)'
    )
    t.throws(
      function () {
        basic.parse('Alpha <a.b></a> charlie.')
      },
      /Unexpected closing tag `<\/a>`, expected corresponding closing tag for `<a.b>` \(1:7-1:12\)/,
      'should crash on mismatched tags (3)'
    )
    t.throws(
      function () {
        basic.parse('Alpha <a></a.b> charlie.')
      },
      /Unexpected closing tag `<\/a.b>`, expected corresponding closing tag for `<a>` \(1:7-1:10\)/,
      'should crash on mismatched tags (4)'
    )
    t.throws(
      function () {
        basic.parse('Alpha <a.b></a.c> charlie.')
      },
      /Unexpected closing tag `<\/a.c>`, expected corresponding closing tag for `<a.b>` \(1:7-1:12\)/,
      'should crash on mismatched tags (5)'
    )
    t.throws(
      function () {
        basic.parse('Alpha <a:b></a> charlie.')
      },
      /Unexpected closing tag `<\/a>`, expected corresponding closing tag for `<a:b>` \(1:7-1:12\)/,
      'should crash on mismatched tags (6)'
    )
    t.throws(
      function () {
        basic.parse('Alpha <a></a:b> charlie.')
      },
      /Unexpected closing tag `<\/a:b>`, expected corresponding closing tag for `<a>` \(1:7-1:10\)/,
      'should crash on mismatched tags (7)'
    )
    t.throws(
      function () {
        basic.parse('Alpha <a:b></a:c> charlie.')
      },
      /Unexpected closing tag `<\/a:c>`, expected corresponding closing tag for `<a:b>` \(1:7-1:12\)/,
      'should crash on mismatched tags (8)'
    )
    t.throws(
      function () {
        basic.parse('Alpha <a:b></a.b> charlie.')
      },
      /Unexpected closing tag `<\/a.b>`, expected corresponding closing tag for `<a:b>` \(1:7-1:12\)/,
      'should crash on mismatched tags (9)'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a>bravo</a/> charlie.')
      },
      /Unexpected self-closing slash `\/` in closing tag, expected the end of the tag/,
      'should crash on a self-closing closing tag'
    )

    t.throws(
      function () {
        basic.parse('Alpha <a>bravo</a b> charlie.')
      },
      /Unexpected attribute in closing tag, expected the end of the tag/,
      'should crash on a closing tag with attributes'
    )

    t.deepEqual(
      clean(basic.parse('Alpha <>bravo <>charlie</> delta</>.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: null, attributes: []}, [
            u('text', 'bravo '),
            u('mdxJsxTextElement', {name: null, attributes: []}, [
              u('text', 'charlie')
            ]),
            u('text', ' delta')
          ]),
          u('text', '.')
        ])
      ]),
      'should parse nested tags'
    )

    t.deepEqual(
      clean(
        basic.parse(
          '<x y="Character references can be used: &quot;, &apos;, &lt;, &gt;, &#x7B;, and &#x7D;, they can be named, decimal, or hexadecimal: &copy; &#8800; &#x1D306;" />.'
        ),
        true
      ),
      u('root', [
        u('paragraph', [
          u(
            'mdxJsxTextElement',
            {
              name: 'x',
              attributes: [
                u(
                  'mdxJsxAttribute',
                  {name: 'y'},
                  'Character references can be used: ", \', <, >, {, and }, they can be named, decimal, or hexadecimal: © ≠ 𝌆'
                )
              ]
            },
            []
          ),
          u('text', '.')
        ])
      ]),
      'should parse character references in attribute values'
    )

    t.deepEqual(
      clean(
        basic.parse(
          '<x>Character references can be used: &quot;, &apos;, &lt;, &gt;, &#x7B;, and &#x7D;, they can be named, decimal, or hexadecimal: &copy; &#8800; &#x1D306;</x>.'
        ),
        true
      ),
      u('root', [
        u('paragraph', [
          u('mdxJsxTextElement', {name: 'x', attributes: []}, [
            u(
              'text',
              'Character references can be used: ", \', <, >, {, and }, they can be named, decimal, or hexadecimal: © ≠ 팆'
            )
          ]),
          u('text', '.')
        ])
      ]),
      'should parse character references in text'
    )

    t.deepEqual(
      clean(basic.parse('Alpha <x />')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: 'x', attributes: []}, [])
        ])
      ]),
      'should parse as inline if the opening is not the first thing'
    )

    t.deepEqual(
      clean(basic.parse('<x />.')),
      u('root', [
        u('paragraph', [
          u('mdxJsxTextElement', {name: 'x', attributes: []}, []),
          u('text', '.')
        ])
      ]),
      'should parse as inline if the closing tag is not the last thing'
    )

    t.deepEqual(
      clean(basic.parse('<x />')),
      u('root', [u('mdxJsxFlowElement', {name: 'x', attributes: []}, [])]),
      'should parse as block if the opening is the first, and the closing the last, thing'
    )

    t.deepEqual(
      clean(basic.parse('<x />\t ')),
      u('root', [u('mdxJsxFlowElement', {name: 'x', attributes: []}, [])]),
      'should parse as block if the opening is the first, and the closing the last, thing (ignoring final whitespace)'
    )

    t.deepEqual(
      clean(basic.parse('\t <x />')),
      u('root', [u('mdxJsxFlowElement', {name: 'x', attributes: []}, [])]),
      'should parse as block if the opening is the first, and the closing the last, thing (ignoring initial whitespace)'
    )

    t.deepEqual(
      clean(basic.parse('<x>\n# Heading\n</x>')),
      u('root', [
        u('mdxJsxFlowElement', {name: 'x', attributes: []}, [
          u('heading', {depth: 1}, [u('text', 'Heading')])
        ])
      ]),
      'should parse content in blocks as block'
    )

    t.deepEqual(
      clean(basic.parse('<x>Paragraph</x>')),
      u('root', [
        u('paragraph', [
          u('mdxJsxTextElement', {name: 'x', attributes: []}, [
            u('text', 'Paragraph')
          ])
        ])
      ]),
      'should parse content in blocks as block (2)'
    )

    t.deepEqual(
      clean(basic.parse('Alpha {1 + 1}')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxTextExpression', {data: {estree: null}}, '1 + 1')
        ])
      ]),
      'should parse expressions as inline if the opening is not the first thing'
    )

    t.deepEqual(
      clean(basic.parse('{1 + 1}.')),
      u('root', [
        u('paragraph', [
          u('mdxTextExpression', {data: {estree: null}}, '1 + 1'),
          u('text', '.')
        ])
      ]),
      'should parse expressions as inline if the closing is not the last thing'
    )

    t.deepEqual(
      clean(basic.parse('{1 + 1}')),
      u('root', [u('mdxFlowExpression', {data: {estree: null}}, '1 + 1')]),
      'should parse expressions as block if the opening is the first, and the closing the last, thing'
    )

    t.deepEqual(
      clean(basic.parse('{1 + 1}\t ')),
      u('root', [u('mdxFlowExpression', {data: {estree: null}}, '1 + 1')]),
      'should parse expressions as block if the opening is the first, and the closing the last, thing (ignoring final whitespace)'
    )

    t.deepEqual(
      clean(basic.parse('\t {1 + 1}')),
      u('root', [u('mdxFlowExpression', {data: {estree: null}}, '1 + 1')]),
      'should parse expressions as block if the opening is the first, and the closing the last, thing (ignoring initial whitespace)'
    )

    t.end()
  })

  t.test('interplay', function (t) {
    t.deepEqual(
      clean(basic.parse('Alpha <b>\nbravo\n</b> charlie.')),
      u('root', [
        u('paragraph', [
          u('text', 'Alpha '),
          u('mdxJsxTextElement', {name: 'b', attributes: []}, [
            u('text', '\nbravo\n')
          ]),
          u('text', ' charlie.')
        ])
      ]),
      'should deal with line feeds'
    )

    t.deepEqual(
      clean(basic.parse('<x># Hello, *{name}*!</x>')),
      u('root', [
        u('paragraph', [
          u('mdxJsxTextElement', {name: 'x', attributes: []}, [
            u('text', '# Hello, '),
            u('emphasis', [
              u('mdxTextExpression', {data: {estree: null}}, 'name')
            ]),
            u('text', '!')
          ])
        ])
      ]),
      'should parse block and inline mdx'
    )

    t.end()
  })

  t.end()
})

test('stringify', function (t) {
  let basic = unified().use(stringify).use(mdx)

  t.throws(
    function () {
      basic.stringify(
        u(
          'mdxJsxTextElement',
          {attributes: [u('mdxJsxAttribute', {name: 'bravo'})]},
          []
        )
      )
    },
    /Cannot serialize fragment w\/ attributes/,
    'should crash when serializing a boolean attribute on a fragment'
  )

  t.throws(
    function () {
      basic.stringify(
        u(
          'mdxJsxTextElement',
          {attributes: [u('mdxJsxAttribute', {name: 'bravo'}, 'bravo')]},
          []
        )
      )
    },
    /Cannot serialize fragment w\/ attributes/,
    'should crash when serializing an attribute on a fragment'
  )

  t.throws(
    function () {
      basic.stringify(
        u(
          'mdxJsxTextElement',
          {attributes: [u('mdxJsxAttribute', {name: 'br:avo'}, 'bravo')]},
          []
        )
      )
    },
    /Cannot serialize fragment w\/ attributes/,
    'should crash when serializing a prefixed attribute on a fragment'
  )

  t.throws(
    function () {
      basic.stringify(
        u(
          'mdxJsxTextElement',
          {attributes: [u('mdxJsxExpressionAttribute', '...props')]},
          []
        )
      )
    },
    /Cannot serialize fragment w\/ attributes/,
    'should crash when serializing an attribute expression on a fragment'
  )

  t.throws(
    function () {
      basic.stringify(
        u(
          'mdxJsxTextElement',
          {
            attributes: [
              u('mdxJsxAttribute', {
                name: 'b',
                value: u(
                  'mdxJsxAttributeValueExpression',
                  {data: {estree: null}},
                  '1 + 1'
                )
              })
            ]
          },
          []
        )
      )
    },
    /Cannot serialize fragment w\/ attributes/,
    'should crash when serializing an attribute value expression on a fragment'
  )

  t.throws(
    function () {
      basic.stringify(
        u(
          'mdxJsxTextElement',
          {name: 'x', attributes: [u('mdxJsxAttribute', {value: 'bravo'})]},
          []
        )
      )
    },
    /Cannot serialize attribute w\/o name/,
    'should crash when serializing an attribute w/o name'
  )

  t.equal(
    basic.stringify(
      u('paragraph', [
        u('text', 'Alpha '),
        u('mdxJsxTextElement', []),
        u('text', ' charlie.')
      ])
    ),
    'Alpha <></> charlie.\n',
    'should serialize an empty nameless fragment'
  )

  t.equal(
    basic.stringify(
      u('paragraph', [
        u('text', 'Alpha '),
        u('mdxJsxTextElement', {name: 'b'}, []),
        u('text', ' charlie.')
      ])
    ),
    'Alpha <b/> charlie.\n',
    'should serialize a tag with a name'
  )

  t.equal(
    basic.stringify(
      u('paragraph', [
        u('text', 'Alpha '),
        u(
          'mdxJsxTextElement',
          {name: 'b', attributes: [u('mdxJsxAttribute', {name: 'bravo'})]},
          []
        ),
        u('text', ' charlie.')
      ])
    ),
    'Alpha <b bravo/> charlie.\n',
    'should serialize a boolean attribute (element)'
  )

  t.equal(
    basic.stringify(
      u('paragraph', [
        u('text', 'Alpha '),
        u(
          'mdxJsxTextElement',
          {
            name: 'b',
            attributes: [u('mdxJsxAttribute', {name: 'bravo'}, 'bravo')]
          },
          []
        ),
        u('text', ' charlie.')
      ])
    ),
    'Alpha <b bravo="bravo"/> charlie.\n',
    'should serialize an attribute (element)'
  )

  t.equal(
    basic.stringify(
      u('paragraph', [
        u('text', 'Alpha '),
        u(
          'mdxJsxTextElement',
          {
            name: 'b',
            attributes: [u('mdxJsxAttribute', {name: 'br:avo'}, 'bravo')]
          },
          []
        ),
        u('text', ' charlie.')
      ])
    ),
    'Alpha <b br:avo="bravo"/> charlie.\n',
    'should serialize a prefixed attribute (element)'
  )

  t.equal(
    basic.stringify(
      u('paragraph', [
        u('text', 'Alpha '),
        u(
          'mdxJsxTextElement',
          {name: 'b', attributes: [u('mdxJsxExpressionAttribute', '...props')]},
          []
        ),
        u('text', ' charlie.')
      ])
    ),
    'Alpha <b {...props}/> charlie.\n',
    'should serialize a attribute expression (element)'
  )

  t.equal(
    basic.stringify(
      u('paragraph', [
        u('text', 'Alpha '),
        u(
          'mdxJsxTextElement',
          {
            name: 'b',
            attributes: [
              u('mdxJsxAttribute', {
                name: 'b',
                value: u(
                  'mdxJsxAttributeValueExpression',
                  {data: {estree: null}},
                  '1 + 1'
                )
              })
            ]
          },
          []
        ),
        u('text', ' charlie.')
      ])
    ),
    'Alpha <b b={1 + 1}/> charlie.\n',
    'should serialize an expression attribute (element)'
  )

  t.equal(
    basic.stringify(
      u('paragraph', [
        u('link', {url: 'https://mdxjs.com'}, [u('text', 'https://mdxjs.com')])
      ])
    ),
    '[https://mdxjs.com](https://mdxjs.com)\n',
    'should write out a url as the raw value'
  )

  t.equal(
    basic.stringify(
      u('paragraph', [u('link', {url: 'https://mdxjs.com'}, [])])
    ),
    '[](https://mdxjs.com)\n',
    'should support links w/o content'
  )

  t.equal(
    basic.stringify(u('paragraph', [u('link', {}, [u('text', '')])])),
    '[]()\n',
    'should support links w/o url'
  )

  t.equal(
    basic.stringify(
      u('paragraph', [u('link', {url: 'a', title: 'b'}, [u('text', 'c')])])
    ),
    '[c](a "b")\n',
    'should support links w/ title'
  )

  t.equal(
    basic.stringify(
      u('paragraph', [
        u('text', 'Alpha '),
        u('mdxJsxTextElement', [
          u('text', 'bravo '),
          u('strong', [u('text', 'charlie')]),
          u('text', ' delta')
        ]),
        u('text', ' echo.')
      ])
    ),
    'Alpha <>bravo **charlie** delta</> echo.\n',
    'should serialize content'
  )

  t.equal(
    basic.stringify(
      u('paragraph', [
        u('text', 'Alpha '),
        u('mdxJsxTextElement', [u('text', '1 < 3')]),
        u('text', ' bravo.')
      ])
    ),
    'Alpha <>1 \\< 3</> bravo.\n',
    'should encode `<` in text'
  )

  t.equal(
    basic.stringify(
      u('paragraph', [
        u('text', 'Alpha '),
        u('mdxJsxTextElement', [u('text', '1 > 3')]),
        u('text', ' bravo.')
      ])
    ),
    'Alpha <>1 > 3</> bravo.\n',
    'should *not* encode `>` in text'
  )

  t.deepEqual(
    basic.stringify(
      u('paragraph', [
        u(
          'mdxJsxTextElement',
          {
            name: 'x',
            attributes: [
              u('mdxJsxAttribute', {
                name: 'y',
                value: '", \', <, >, {, }, ©, ≠, and 𝌆.'
              })
            ]
          },
          []
        ),
        u('text', '.')
      ])
    ),
    '<x y="&#x22;, \', <, >, {, }, ©, ≠, and 𝌆."/>.\n',
    'should encode `"` in attribute values, but no other character references.'
  )

  t.deepEqual(
    basic.stringify(
      u('paragraph', [
        u('mdxJsxTextElement', {name: 'x'}, [
          u(
            'text',
            'Character references can be used: ", \', <, >, {, and }, they can be named, decimal, or hexadecimal: © ≠ 𝌆'
          )
        ]),
        u('text', '.')
      ])
    ),
    '<x>Character references can be used: ", \', \\<, >, \\{, and }, they can be named, decimal, or hexadecimal: © ≠ 𝌆</x>.\n',
    'should encode `"`, `\'`, `<`, and `{` in text, but no other character references.'
  )

  t.equal(
    basic.stringify(
      u('paragraph', [
        u('text', 'Alpha '),
        u('mdxJsxTextElement', [u('text', '1 { 3')]),
        u('text', ' bravo.')
      ])
    ),
    'Alpha <>1 \\{ 3</> bravo.\n',
    'should encode `{` in text'
  )

  t.equal(
    basic.stringify(
      u('paragraph', [
        u('text', 'Alpha '),
        u('mdxJsxTextElement', [u('text', '1 } 3')]),
        u('text', ' bravo.')
      ])
    ),
    'Alpha <>1 } 3</> bravo.\n',
    'should *not* encode `}` in text'
  )

  t.equal(
    basic.stringify(
      u('paragraph', [
        u('text', 'Alpha '),
        u('mdxTextExpression'),
        u('text', ' bravo.')
      ])
    ),
    'Alpha {} bravo.\n',
    'should serialize empty expressions'
  )

  t.equal(
    basic.stringify(
      u('paragraph', [
        u('text', 'Alpha '),
        u('mdxTextExpression', '1 + 1'),
        u('text', ' bravo.')
      ])
    ),
    'Alpha {1 + 1} bravo.\n',
    'should serialize expressions'
  )

  t.end()
})

test('fixtures', function (t) {
  fs.readdirSync(base)
    .filter(d => /\.md$/.test(d))
    .forEach(name => {
      console.log(name)
      let proc = unified().use(parse).use(stringify).use(mdx)
      let fpIn = path.join(base, name)
      let fpExpected = fpIn.replace(/\.md$/, '.json')
      let fpExpectedDoc = fpIn.replace(/\.md$/, '.out')
      let input = vfile.readSync(fpIn)
      let tree = proc.parse(input)
      let doc = proc.stringify(tree)
      let reparsed
      let expected
      let expectedDoc

      try {
        expected = JSON.parse(vfile.readSync(fpExpected))
      } catch (_) {
        expected = tree
        vfile.writeSync({
          path: fpExpected,
          contents: JSON.stringify(expected, null, 2) + '\n'
        })
      }

      t.deepLooseEqual(tree, expected, input.stem + ' (tree)')

      try {
        expectedDoc = String(vfile.readSync(fpExpectedDoc))
      } catch (_) {
        expectedDoc = String(input)

        if (expectedDoc !== doc) {
          expectedDoc = doc
          vfile.writeSync({path: fpExpectedDoc, contents: expectedDoc})
        }
      }

      // Windows.
      expectedDoc = expectedDoc.replace(/\r\n/g, '\n')

      t.deepEqual(doc, expectedDoc, input.stem + ' (doc)')

      reparsed = proc.parse(doc)

      t.deepEqual(clean(reparsed), clean(tree), input.stem + ' (re)')
    })

  t.end()
})

function clean(tree) {
  remove(tree, true)
  cleanEstree(tree)
  return tree
}

function cleanEstree(tree) {
  visit(
    tree,
    [
      'mdxjsEsm',
      'mdxTextExpression',
      'mdxFlowExpression',
      'mdxJsxTextElement',
      'mdxJsxFlowElement'
    ],
    onvisit
  )
  return tree

  function onvisit(node) {
    if (node.data && node.data.estree) {
      node.data.estree = null
    }

    if (
      node.type === 'mdxJsxTextElement' ||
      node.type === 'mdxJsxFlowElement'
    ) {
      node.attributes.forEach(onattribute)
    }
  }

  function onattribute(node) {
    onvisit(node)
    if (node.value) onvisit(node.value)
  }
}
