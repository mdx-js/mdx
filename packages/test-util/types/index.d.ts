// TypeScript Version: 3.4

import {ParseResult} from '@babel/core'
import {ComponentType} from 'react'

export function parse(code: string): ParseResult
export function tranform(code: string): string
export function renderWithReact(
  code: string,
  components?: {
    [name: string]: ComponentType<any>
  }
): Promise<string>
