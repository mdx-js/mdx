/**
 * @import {CheckFlag} from 'remark-lint-fenced-code-flag'
 * @import {Preset} from 'unified'
 */

import remarkPresetWooorm from 'remark-preset-wooorm'
import remarkLintFencedCodeFlag, {
  checkGithubLinguistFlag
} from 'remark-lint-fenced-code-flag'
import remarkLintNoHtml from 'remark-lint-no-html'
import remarkValidateLinks from 'remark-validate-links'

/** @type {Preset} */
const remarkPresetMdx = {
  plugins: [
    remarkPresetWooorm,
    [remarkLintFencedCodeFlag, check],
    [remarkLintNoHtml, false],
    [remarkValidateLinks, false]
  ]
}

export default remarkPresetMdx

/**
 * Check according to GitHub Linguist.
 *
 * @param {string} value
 *   Language flag to check.
 * @returns {string | undefined}
 *   Whether the flag is valid (`undefined`),
 *   or a message to warn about (`string`).
 * @satisfies {CheckFlag}
 */
function check(value) {
  // To do: investigate if we can change ` ```jsx ` -> ` ```js `?
  if (value === 'jsx' || value === 'mdx-invalid') return undefined
  return checkGithubLinguistFlag(value)
}
