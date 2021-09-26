/**
 * These types are in an actual TypeScript file because otherwise TS would
 * “expand” them which will result in a giant file.
 *
 * @todo `vue` has a rather useless `JSX`. Should we use something else?
 */

import type {Component} from 'vue'

type IntrinsicNames = keyof JSX.IntrinsicElements

type IntrinsicComponents = Partial<{
  [TagName in IntrinsicNames]:
    | IntrinsicNames
    | Component<JSX.IntrinsicElements[TagName]>
}>

type ExtrinsicComponents = {
  [componentName: string]: Component | ExtrinsicComponents
}

export type Components = IntrinsicComponents & ExtrinsicComponents
