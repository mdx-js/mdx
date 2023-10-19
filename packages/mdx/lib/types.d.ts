import type {Data as UnistData} from 'unist'

interface EsastData extends UnistData {
  /**
   * Whether a node was authored as explicit JSX (`<h1>`) or as implicitly
   * turned into JSX (`# hi`).
   *
   * Registered by `@mdx-js/mdx/lib/types.d.ts`.
   */
  _mdxExplicitJsx?: boolean | null | undefined
}

// Register data on `estree`.
declare module 'estree' {
  interface BaseNode {
    /**
     * Extra unist data passed through from mdast through hast to esast.
     *
     * Registered by `@mdx-js/mdx/lib/types.d.ts`.
     */
    data?: EsastData | undefined
  }
}

// Register data on `mdast`.
declare module 'mdast-util-mdx-jsx' {
  interface MdxJsxFlowElementData {
    /**
     * Whether a node was authored as explicit JSX (`<h1>`) or as implicitly
     * turned into JSX (`# hi`).
     *
     * Registered by `@mdx-js/mdx/lib/types.d.ts`.
     */
    _mdxExplicitJsx?: boolean | null | undefined
  }

  interface MdxJsxTextElementData {
    /**
     * Whether a node was authored as explicit JSX (`<h1>`) or as implicitly
     * turned into JSX (`# hi`).
     *
     * Registered by `@mdx-js/mdx/lib/types.d.ts`.
     */
    _mdxExplicitJsx?: boolean | null | undefined
  }
}
