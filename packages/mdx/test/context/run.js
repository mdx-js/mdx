/**
 * @import {MDXContent, MDXModule} from 'mdx/types.js'
 * @import {Compatible} from 'vfile'
 */

import fs from 'node:fs/promises'

/**
 * @param {Readonly<Compatible>} input
 *   MDX document.
 * @return {Promise<MDXContent>}
 *   MDX content.
 */
export async function run(input) {
  const result = await runWhole(input)
  return result.default
}

/**
 *
 * @param {Readonly<Compatible>} input
 *   MDX document.
 * @return {Promise<MDXModule>}
 *   MDX module.
 */
export async function runWhole(input) {
  const fileName = 'fixture-' + Math.random() + '.js'
  const fileUrl = new URL(fileName, import.meta.url)
  const document = String(input)

  await fs.writeFile(fileUrl, document)

  try {
    /** @type {MDXModule} */
    return await import(fileUrl.href)
  } finally {
    // This is not a bug: the `finally` runs after the whole `try` block, but
    // before the `return`.
    await fs.rm(fileUrl)
  }
}
