import { createId, createLogger, PackLoader } from '@pssbletrngle/data-modifier'
import type { InferIds, ItemId, WorldgenBiomeId } from '@pssbletrngle/data-modifier/generated'

const logger = createLogger()
const loader = new PackLoader(logger, { packFormat: 15 })

const item: ItemId = 'minecraft:acacia_boat'
const otherItem: InferIds<'minecraft:item'> = 'minecraft:acacia_door'
const biome: WorldgenBiomeId = 'minecraft:basalt_deltas'

createId(biome)

loader.recipes.replaceResult('minecraft:emerald', { item: 'minecraft:sapphire' })
loader.recipes.replaceResult(otherItem, { item })
