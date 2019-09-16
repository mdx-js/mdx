const babel = require('@babel/core')

const plugin = require('..')

const testContents = `
import React from 'react';
const MDXContent = function () {};
export default MDXContent;
`

const expectedResults = `import React from 'react';

const MDXContent = function () {};

export default React.memo(MDXContent);`

describe('babel-plugin-wrap-default-export', () => {
  test('wraps the default export', () => {
    const result = babel.transform(testContents, {
      configFile: false,
      plugins: [[plugin, {wrapper: 'React.memo'}]],
      presets: [require('@babel/preset-react')]
    })

    expect(result.code).toEqual(expectedResults)
  })
})
