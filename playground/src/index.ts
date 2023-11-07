import { createLogger, PackLoader } from '@pssbletrngle/data-modifier'
import type { InferIds, ItemId } from '@pssbletrngle/data-modifier/generated'

const logger = createLogger()
const loader = new PackLoader(logger)

type WorldgenBiomeId = InferIds<'minecraft:worldgen/biome'>

const item: ItemId = 'minecraft:acacia_boat'
const otherItem: InferIds<'minecraft:item'> = 'minecraft:acacia_door'
const biome: WorldgenBiomeId = 'minecraft:basalt_deltas'

loader.recipes.replaceResult('minecraft:emerald', { item: 'minecraft:sapphire' })
