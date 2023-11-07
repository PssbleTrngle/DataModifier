import { createLogger, PackLoader } from '@pssbletrngle/data-modifier'
import type { IdMap, InferIds, ItemId } from 'whatever'

const logger = createLogger()
const loader = new PackLoader(logger)

type WorldgenBiomeId = InferIds<'minecraft:worldgen/biome'>

const value: IdMap['registry'] = 'test'

const item: ItemId = ''
const otherItem: InferIds<'minecraft:item'> = 'something:else'
const biome: WorldgenBiomeId = 'minecraft:basalt_deltas'

loader.recipes.replaceResult('minecraft:ruby', { item: 'minecraft:sapphire' })
