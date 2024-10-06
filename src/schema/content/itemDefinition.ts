import { BlockDefinition } from './blockDefinition.js'

// TODO missing values
export type Rarity = 'common' | 'rare'

export type ItemProperties = Readonly<{
   rarity?: Rarity
   stack_size?: number
   creative_tab?: string
}>

export type ItemDefinition = Readonly<{
   type: string
   properties?: ItemProperties
}>

export type BlockItemDefinition = ItemDefinition &
   Readonly<{
      block: BlockDefinition
   }>
