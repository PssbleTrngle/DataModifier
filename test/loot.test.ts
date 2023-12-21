import createTestAcceptor from './mock/TestAcceptor.js'
import { LootEntrySchema, LootTableSchema } from '../src/schema/data/loot.js'
import { EMPTY_LOOT_TABLE } from '../src/emit/data/loot.js'
import setupLoader from './shared/loaderSetup.js'

const { logger, loader } = setupLoader({ include: ['data/*/loot_tables/**/*.json', 'data/*/tags/**/*.json'] })

afterEach(() => {
   loader.clear()
})

describe('loading of loot tables', () => {
   it('loads loot tables without errors', async () => {
      expect(logger.warn).not.toHaveBeenCalled()
      expect(logger.error).not.toHaveBeenCalled()
   })
})

describe('loot tables output replacements', () => {
   it('removes outputs', async () => {
      const acceptor = createTestAcceptor()

      loader.loot.removeOutput('#minecraft:iron_ores')

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('data/minecraft/loot_tables/blocks/iron_ore.json')).toMatchSnapshot(
         'modified deepslate_iron_ore loot table'
      )
      expect(acceptor.jsonAt('data/minecraft/loot_tables/blocks/deepslate_iron_ore.json')).toMatchSnapshot(
         'modified iron_ore loot table'
      )
   })

   it('replaces outputs with additional tests', async () => {
      const acceptor = createTestAcceptor()

      loader.loot.replaceOutput('#forge:ingots/iron', { tag: 'forge:ingots/lead' }, { id: /minecraft:entities\/.+/ })

      await loader.emit(acceptor)

      expect(acceptor.paths().length).toBe(4)

      expect(acceptor.jsonAt('data/minecraft/loot_tables/entities/husk.json')).toMatchSnapshot(
         'modified husk loot table'
      )
      expect(acceptor.jsonAt('data/minecraft/loot_tables/entities/iron_golem.json')).toMatchSnapshot(
         'modified iron_golem loot table'
      )
      expect(acceptor.jsonAt('data/minecraft/loot_tables/entities/zombie.json')).toMatchSnapshot(
         'modified zombie loot table'
      )
      expect(acceptor.jsonAt('data/minecraft/loot_tables/entities/zombie_villager.json')).toMatchSnapshot(
         'modified zombie_villager loot table'
      )
   })

   it('keeps extended loot entry properties', async () => {
      const acceptor = createTestAcceptor()

      loader.loot.replaceOutput('farmersdelight:rice', { item: 'minecraft:apple' })

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('data/farmersdelight/loot_tables/blocks/wild_rice.json')).toMatchSnapshot(
         'modified wild rice loot table'
      )
   })
})

describe('loot table removal', () => {
   it('removes loot table with id filter', async () => {
      const acceptor = createTestAcceptor()

      loader.loot.disable({
         id: /minecraft:.*oak_log/,
      })

      await loader.emit(acceptor)

      expect(acceptor.paths().length).toBe(4)

      expect(acceptor.jsonAt('data/minecraft/loot_tables/blocks/oak_log.json')).toMatchObject(EMPTY_LOOT_TABLE)
      expect(acceptor.jsonAt('data/minecraft/loot_tables/blocks/stripped_oak_log.json')).toMatchObject(EMPTY_LOOT_TABLE)
      expect(acceptor.jsonAt('data/minecraft/loot_tables/blocks/dark_oak_log.json')).toMatchObject(EMPTY_LOOT_TABLE)
      expect(acceptor.jsonAt('data/minecraft/loot_tables/blocks/stripped_dark_oak_log.json')).toMatchObject(
         EMPTY_LOOT_TABLE
      )
   })

   it('removes loot table with output filter', async () => {
      const acceptor = createTestAcceptor()

      loader.loot.disable({
         output: '#minecraft:logs',
      })

      await loader.emit(acceptor)

      expect(acceptor.paths()).toMatchSnapshot('loot tables containing any log')
   })
})

it('creates custom loot tables', async () => {
   const acceptor = createTestAcceptor()

   const lootTable = LootTableSchema.parse({
      type: 'minecraft:block',
      pools: [
         {
            rolls: 4,
            entries: [
               LootEntrySchema.parse({
                  type: 'minecraft:alternatives',
                  children: [
                     LootEntrySchema.parse({
                        type: 'minecraft:item',
                        name: 'minecraft:diamond',
                     }),
                  ],
               }),
               LootEntrySchema.parse({
                  type: 'minecraft:tag',
                  name: 'minecraft:logs',
               }),
            ],
         },
      ],
   })

   loader.loot.add('example:custom', lootTable)

   await loader.emit(acceptor)

   expect(acceptor.jsonAt('data/example/loot_tables/custom.json')).toMatchSnapshot('parsed loot table')
   expect(acceptor.jsonAt('data/example/loot_tables/custom.json')).toMatchObject(lootTable)
})
