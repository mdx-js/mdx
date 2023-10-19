/**
 * @typedef {import('@mdx-js/mdx').CompileOptions} CompileOptions
 * @typedef {import('@wooorm/starry-night').Grammar} Grammar
 * @typedef {import('estree').Program} Program
 * @typedef {import('hast').ElementContent} ElementContent
 * @typedef {import('hast').Root} Root
 * @typedef {import('vfile').VFile} VFile
 */

/**
 * @typedef MetaOptions
 *   Configuration.
 * @property {ReadonlyArray<string> | null | undefined} [include]
 *   List of keys to include (optional).
 * @property {ReadonlyArray<string> | null | undefined} [exclude]
 *   List of keys to exclude (optional).
 */

import {pathToFileURL} from 'node:url'
import {nodeTypes} from '@mdx-js/mdx'
import {common, createStarryNight} from '@wooorm/starry-night'
import sourceMdx from '@wooorm/starry-night/source.mdx'
import sourceTsx from '@wooorm/starry-night/source.tsx'
import {valueToEstree} from 'estree-util-value-to-estree'
import {h, s} from 'hastscript'
import {toString} from 'hast-util-to-string'
import {toText} from 'hast-util-to-text'
import {analyze} from 'periscopic'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeInferDescriptionMeta from 'rehype-infer-description-meta'
import rehypeInferReadingTimeMeta from 'rehype-infer-reading-time-meta'
import rehypeInferTitleMeta from 'rehype-infer-title-meta'
import rehypeMinifyUrl from 'rehype-minify-url'
import rehypeShiftHeading from 'rehype-shift-heading'
import rehypeSlug from 'rehype-slug'
import rehypePresetMinify from 'rehype-preset-minify'
import rehypeRaw from 'rehype-raw'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGemoji from 'remark-gemoji'
import remarkGfm from 'remark-gfm'
import remarkGithub from 'remark-github'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkSqueezeParagraphs from 'remark-squeeze-paragraphs'
import remarkStripBadges from 'remark-strip-badges'
import remarkToc from 'remark-toc'
import {visit} from 'unist-util-visit'
import {config} from '../docs/_config.js'

/** @type {Readonly<CompileOptions>} */
const options = {
  recmaPlugins: [recmaInjectMeta],
  rehypePlugins: [
    rehypePrettyCodeBlocks,
    [rehypeRaw, {passThrough: nodeTypes}],
    unifiedInferRemoteMeta,
    [
      rehypeInferDescriptionMeta,
      {inferDescriptionHast: true, truncateSize: 280}
    ],
    rehypeInferReadingTimeMeta,
    rehypeInferTitleMeta,
    [rehypeShiftHeading, {shift: 1}],
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: 'prepend',
        content: link(),
        properties: {ariaLabel: 'Link to this section', className: ['anchor']}
      }
    ],
    [rehypeStarryNight, {grammars: [...common, sourceMdx, sourceTsx]}],
    rehypePresetMinify,
    rehypeMinifyUrl
  ],
  remarkPlugins: [
    remarkFrontmatter,
    remarkGemoji,
    remarkGfm,
    remarkGithub,
    // @ts-expect-error: to do: fix types in `remark-mdx-frontmatter`.
    [remarkMdxFrontmatter, {name: 'matter'}],
    remarkStripBadges,
    remarkSqueezeParagraphs,
    [remarkToc, {maxDepth: 3}]
  ]
}

export default options

function link() {
  return s(
    'svg.icon',
    {
      ariaHidden: 'true',
      viewBox: [0, 0, 16, 16],
      focusable: false,
      width: 18,
      height: 18
    },
    s('path', {
      fill: 'currentcolor',
      d: 'M7.775 3.275C7.64252 3.41717 7.57039 3.60522 7.57382 3.79952C7.57725 3.99382 7.65596 4.1792 7.79337 4.31662C7.93079 4.45403 8.11617 4.53274 8.31047 4.53617C8.50477 4.5396 8.69282 4.46748 8.835 4.335L10.085 3.085C10.2708 2.89918 10.4914 2.75177 10.7342 2.65121C10.977 2.55064 11.2372 2.49888 11.5 2.49888C11.7628 2.49888 12.023 2.55064 12.2658 2.65121C12.5086 2.75177 12.7292 2.89918 12.915 3.085C13.1008 3.27082 13.2482 3.49142 13.3488 3.7342C13.4493 3.97699 13.5011 4.23721 13.5011 4.5C13.5011 4.76279 13.4493 5.023 13.3488 5.26579C13.2482 5.50857 13.1008 5.72917 12.915 5.915L10.415 8.415C10.2292 8.60095 10.0087 8.74847 9.76588 8.84911C9.52308 8.94976 9.26283 9.00157 9 9.00157C8.73716 9.00157 8.47691 8.94976 8.23411 8.84911C7.99132 8.74847 7.77074 8.60095 7.585 8.415C7.44282 8.28252 7.25477 8.21039 7.06047 8.21382C6.86617 8.21725 6.68079 8.29596 6.54337 8.43337C6.40596 8.57079 6.32725 8.75617 6.32382 8.95047C6.32039 9.14477 6.39252 9.33282 6.525 9.475C6.85001 9.80004 7.23586 10.0579 7.66052 10.2338C8.08518 10.4097 8.54034 10.5002 9 10.5002C9.45965 10.5002 9.91481 10.4097 10.3395 10.2338C10.7641 10.0579 11.15 9.80004 11.475 9.475L13.975 6.975C14.6314 6.31858 15.0002 5.4283 15.0002 4.5C15.0002 3.57169 14.6314 2.68141 13.975 2.025C13.3186 1.36858 12.4283 0.999817 11.5 0.999817C10.5717 0.999817 9.68141 1.36858 9.02499 2.025L7.775 3.275ZM3.085 12.915C2.89904 12.7292 2.75152 12.5087 2.65088 12.2659C2.55023 12.0231 2.49842 11.7628 2.49842 11.5C2.49842 11.2372 2.55023 10.9769 2.65088 10.7341C2.75152 10.4913 2.89904 10.2707 3.085 10.085L5.585 7.585C5.77074 7.39904 5.99132 7.25152 6.23411 7.15088C6.47691 7.05023 6.73716 6.99842 7 6.99842C7.26283 6.99842 7.52308 7.05023 7.76588 7.15088C8.00867 7.25152 8.22925 7.39904 8.415 7.585C8.55717 7.71748 8.74522 7.7896 8.93952 7.78617C9.13382 7.78274 9.3192 7.70403 9.45662 7.56662C9.59403 7.4292 9.67274 7.24382 9.67617 7.04952C9.6796 6.85522 9.60748 6.66717 9.475 6.525C9.14999 6.19995 8.76413 5.94211 8.33947 5.7662C7.91481 5.59029 7.45965 5.49974 7 5.49974C6.54034 5.49974 6.08518 5.59029 5.66052 5.7662C5.23586 5.94211 4.85001 6.19995 4.525 6.525L2.025 9.02499C1.36858 9.68141 0.999817 10.5717 0.999817 11.5C0.999817 12.4283 1.36858 13.3186 2.025 13.975C2.68141 14.6314 3.57169 15.0002 4.5 15.0002C5.4283 15.0002 6.31858 14.6314 6.975 13.975L8.225 12.725C8.35748 12.5828 8.4296 12.3948 8.42617 12.2005C8.42274 12.0062 8.34403 11.8208 8.20662 11.6834C8.0692 11.546 7.88382 11.4672 7.68952 11.4638C7.49522 11.4604 7.30717 11.5325 7.165 11.665L5.915 12.915C5.72925 13.1009 5.50867 13.2485 5.26588 13.3491C5.02308 13.4498 4.76283 13.5016 4.5 13.5016C4.23716 13.5016 3.97691 13.4498 3.73411 13.3491C3.49132 13.2485 3.27074 13.1009 3.085 12.915Z'
    })
  )
}

/**
 * @returns
 *   Transform.
 */
function unifiedInferRemoteMeta() {
  /**
   * @param {Root} _
   *   Tree.
   * @param {VFile} file
   *   File.
   * @returns {undefined}
   *   Nothing.
   */
  return function (_, file) {
    const meta = file.data.meta || (file.data.meta = {})

    const fileUrl = pathToFileURL(file.path)
    const parts = fileUrl.href.slice(config.git.href.length - 1).split('/')
    /** @type {string} */
    let fp

    if (parts[1] === 'docs') {
      fp = ('/' + parts.slice(2).join('/'))
        .replace(/\.mdx$/, '/')
        .replace(/\/index\/$/, '/')
    } else {
      // Symlinks, which we have to hack around.
      if (parts[1] !== 'packages' || parts.at(-1) !== 'readme.md') {
        throw new Error(
          'Expected symlinked file to match `/packages/*/readme.md`'
        )
      }

      fp = parts.slice(0, -1).join('/') + '/'
    }

    const url = new URL(fp, config.site)

    meta.origin = url.origin
    meta.pathname = url.pathname
  }
}

/**
 * @param {Readonly<MetaOptions> | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
function recmaInjectMeta(options) {
  const {exclude, include} = options || {}
  /**
   * @param {Program} tree
   *   Tree.
   * @param {VFile} file
   *   File.
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree, file) {
    // Find everything that’s defined in the top-level scope.
    const topScope = analyze(tree).scope.declarations

    // Exit if `meta` is already defined.
    if (topScope.has('meta')) return

    // Treat as arbitrary object.
    const meta = /** @type {Record<string, unknown>} */ (file.data.meta || {})
    /** @type {Record<string, unknown>} */
    const value = {}
    /** @type {string} */
    let key

    for (key in meta) {
      if (
        Object.hasOwn(meta, key) &&
        (!exclude || !exclude.includes(key)) &&
        (!include || include.includes(key))
      ) {
        value[key] = meta[key]
      }
    }

    tree.body.unshift({
      type: 'ExportNamedDeclaration',
      declaration: {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {type: 'Identifier', name: 'meta'},
            init: valueToEstree(value, {instanceAsObject: true})
          }
        ]
      },
      source: undefined,
      specifiers: []
    })
  }
}

function rehypePrettyCodeBlocks() {
  const re = /\b([-\w]+)(?:=(?:"([^"]*)"|'([^']*)'|([^"'\s]+)))?/g

  /** @type {Readonly<Record<string, string>>} */
  const languageNames = {
    diff: 'Diff',
    html: 'HTML',
    js: 'JavaScript',
    jsx: 'JavaScript',
    md: 'Markdown',
    mdx: 'MDX',
    sh: 'Shell',
    txt: 'Plain text',
    ts: 'TypeScript',
    tsx: 'TypeScript'
  }

  /**
   * @param {Root} tree
   *   Tree.
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree) {
    visit(tree, 'element', function (node, index, parent) {
      if (node.tagName !== 'pre' || !parent || index === undefined) {
        return
      }

      const code = node.children[0]

      if (
        !code ||
        code.type !== 'element' ||
        code.tagName !== 'code' ||
        node.children.length > 1
      ) {
        return
      }

      /** @type {Record<string, string>} */
      const metaProps = {}
      const meta = code.data?.meta

      if (meta) {
        /** @type {RegExpMatchArray | null} */
        let match
        re.lastIndex = 0 // Reset regex.

        while ((match = re.exec(meta))) {
          metaProps[match[1]] = match[2] || match[3] || match[4] || ''
        }
      }

      if (metaProps.chrome === 'no') {
        return
      }

      const textContent = toText(node)
      /** @type {Array<ElementContent>} */
      const children = [node]
      const className = Array.isArray(code.properties.className)
        ? code.properties.className
        : []
      const lang = className.find(function (value) {
        return String(value).slice(0, 9) === 'language-'
      })
      /** @type {Array<ElementContent>} */
      const footer = []
      /** @type {Array<ElementContent>} */
      const header = []
      const language =
        metaProps.language || (lang ? String(lang).slice(9) : undefined)

      // Not giant.
      if (textContent.length < 8192 && metaProps.copy !== 'no') {
        footer.push({
          type: 'element',
          tagName: 'button',
          properties: {
            className: ['copy-button'],
            dataValue: textContent
          },
          children: []
        })
      }

      if (metaProps.path) {
        header.push(
          h('span.frame-tab-item.frame-tab-item-selected', metaProps.path)
        )
      } else if (language) {
        if (!Object.hasOwn(languageNames, language)) {
          console.log(
            '[mdx-config]: warn: please add %s to have a nice language name',
            language
          )
        }

        header.push(
          h(
            'span.frame-tab-item.frame-tab-item-language.frame-tab-item-inactive',
            languageNames[language] || language
          )
        )
      }

      if (header && header.length > 0) {
        children.unshift(h('.frame-tab-bar.frame-tab-bar-scroll', header))
      }

      if (footer && footer.length > 0) {
        children.push(...footer)
      }

      parent.children[index] = h('.frame.code-frame', children)
    })
  }
}

// See:
// <https://github.com/wooorm/starry-night#example-integrate-with-unified-remark-and-rehype>.
/**
 * @typedef Options
 *   Configuration (optional)
 * @property {Array<Grammar> | null | undefined} [grammars]
 *   Grammars to support (default: `common`).
 */

/**
 * Highlight code with `starry-night`.
 *
 * @param {Readonly<Options> | null | undefined} options
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
function rehypeStarryNight(options) {
  const settings = options || {}
  const grammars = settings.grammars || common
  const starryNightPromise = createStarryNight(grammars)
  const prefix = 'language-'

  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   * @returns {Promise<undefined>}
   *   Nothing.
   */
  return async function (tree) {
    const starryNight = await starryNightPromise

    visit(tree, 'element', function (node, index, parent) {
      if (!parent || typeof index !== 'number' || node.tagName !== 'pre') {
        return
      }

      const head = node.children[0]

      if (
        !head ||
        head.type !== 'element' ||
        head.tagName !== 'code' ||
        !head.properties
      ) {
        return
      }

      const classes = head.properties.className

      if (!Array.isArray(classes)) return

      const language = classes.find(function (d) {
        return typeof d === 'string' && d.startsWith(prefix)
      })

      if (typeof language !== 'string') return

      const name = language.slice(prefix.length)

      const scope = starryNight.flagToScope(name)

      // Maybe warn?
      if (!scope) {
        if (name !== 'txt') console.warn('Missing language: %s', name)
        return
      }

      const fragment = starryNight.highlight(toString(head), scope)
      // Cast because we don’t expect doctypes.
      const children = /** @type {Array<ElementContent>} */ (fragment.children)

      parent.children.splice(index, 1, {
        type: 'element',
        tagName: 'pre',
        properties: {},
        children: [
          {
            type: 'element',
            tagName: 'code',
            properties: {
              className: [
                'language-' +
                  scope.replace(/^source\./, '').replaceAll('.', '-')
              ]
            },
            children
          }
        ]
      })
    })
  }
}
