import type {Author} from './generate.js'

// Add custom data supported when `rehype-document` is added.
declare module 'vfile' {
  interface DataMapMeta {
    /**
     * Authors associated with a document.
     *
     * Registered by `website/types.d.ts` for the MDX website.
     */
    authors?: Array<Author> | null | undefined

    /**
     * Extra schema to add in an `application/ld+json` script.
     *
     * Registered by `website/types.d.ts` for the MDX website.
     */
    schemaOrg?: unknown
  }

  interface DataMap {
    meta: DataMapMeta
  }
}

// Register data on hast.
declare module 'hast' {
  interface ElementData {
    /**
     * `meta` field available on `<code>` elements; added by `mdast-util-to-hast`.
     *
     * Registered by `website/types.d.ts` for the MDX website.
     */
    meta?: string | null | undefined
  }
}
