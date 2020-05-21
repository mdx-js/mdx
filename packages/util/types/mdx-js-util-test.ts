import {
  EMPTY_NEWLINE,
  isImport,
  isExport,
  isExportDefault,
  isImportOrExport,
  startsWithCapitalLetter,
  isComment,
  getCommentContents,
  paramCase,
  toTemplateLiteral
} from '@mdx-js/util'

EMPTY_NEWLINE // $ExpectType string
isImport('') // $ExpectType boolean
isExport('') // $ExpectType boolean
isExportDefault('') // $ExpectType boolean
isImportOrExport('') // $ExpectType boolean
startsWithCapitalLetter('') // $ExpectType boolean
isComment('') // $ExpectType boolean
getCommentContents('') // $ExpectType string
paramCase('') // $ExpectType string
toTemplateLiteral('') // $ExpectType string
