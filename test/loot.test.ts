import PackLoader from '../src/loader/pack'
import createTestLogger from './mock/TestLogger'
import createTestResolver from './mock/TestResolver'
import createTestAcceptor from './mock/TestAcceptor'
import {
   LootEntryAlternativeSchema,
   LootEntryItemSchema,
   LootEntryTagSchema,
   LootTableSchema,
} from '../src/schema/loot'

const logger = createTestLogger()
const loader = new PackLoader(logger)

beforeAll(async () => {
   const resolver = createTestResolver({ include: ['data/*/loot_tables/**/*.json'] })
   await loader.loadFrom(resolver)
}, 10_000)

afterEach(() => {
   loader.clear()
})

describe('loading of loot tables', () => {
   it('loads loot tables without errors', async () => {
      expect(logger.warn).not.toHaveBeenCalled()
      expect(logger.error).not.toHaveBeenCalled()
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
               LootEntryAlternativeSchema.parse({
                  type: 'minecraft:alternatives',
                  children: [
                     LootEntryItemSchema.parse({
                        type: 'minecraft:item',
                        name: 'minecraft:diamond',
                     }),
                  ],
               }),
               LootEntryTagSchema.parse({
                  type: 'minecraft:tag',
                  name: 'minecraft:logs',
               }),
            ],
         },
      ],
   })

   loader.loot.addLootTable('example:custom', lootTable)

   await loader.emit(acceptor)

   expect(acceptor.jsonAt('data/example/loot_tables/custom.json')).toMatchSnapshot('parsed loot table')
   expect(acceptor.jsonAt('data/example/loot_tables/custom.json')).toMatchObject(lootTable)
})
