import * as React from 'react'
import {parse, tranform, renderWithReact} from '@mdx-js/test-util'

parse('') // $ExpectType ParseResult
tranform('') // $ExpectType string
renderWithReact('') // $ExpectType Promise<string>
renderWithReact('', {a: () => <></>}) // $ExpectType Promise<string>
