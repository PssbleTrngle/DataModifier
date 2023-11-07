import { createLogger, ItemId, PackLoader, WorldgenBiomeId } from '@pssbletrngle/data-modifier'

const logger = createLogger()
const loader = new PackLoader(logger)

const item: ItemId = ''
const biome: WorldgenBiomeId = ''

loader.recipes.replaceResult('minecraft:ruby', { item: 'minecraft:sapphire' })
