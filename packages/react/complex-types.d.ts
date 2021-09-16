/**
 * These types are in an actual TypeScript file because otherwise TS would
 * “expand” them which will result in a giant file.
 */

import type {ComponentType} from 'react'

type IntrinsicNames = keyof JSX.IntrinsicElements

type IntrinsicComponents = Partial<{
  [TagName in IntrinsicNames]:
    | IntrinsicNames
    | ComponentType<JSX.IntrinsicElements[TagName]>
}>

type ExtrinsicComponents = {
  [componentName: string]: ComponentType<any> | ExtrinsicComponents
}

export type Components = IntrinsicComponents & ExtrinsicComponents
