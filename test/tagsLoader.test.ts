import PackLoader from '../src/loader/pack'
import createTestLogger from './mock/TestLogger'
import createTestResolver from './mock/TestResolver'

const logger = createTestLogger()
const loader = new PackLoader(logger)

beforeAll(async () => {
   const resolver = createTestResolver({ include: ['data/*/tags/**/*.json'] })
   await loader.loadFrom(resolver)
}, 10_000)

afterEach(() => {
   loader.clear()
})

test('loads tags correctly', async () => {
   const itemTags = loader.tagRegistry.registry('items')
   const blockTags = loader.tagRegistry.registry('blocks')

   expect(blockTags.list().length).toBe(259)
   expect(itemTags.list().length).toBe(302)

   expect(blockTags.get('#minecraft:mineable/pickaxe')).toMatchSnapshot()
   expect(itemTags.get('#minecraft:logs')).toMatchSnapshot()
})

test('resolves tags correctly', async () => {
   const itemTags = loader.tagRegistry.registry('items')
   const blockTags = loader.tagRegistry.registry('blocks')

   expect(blockTags.resolve('#minecraft:mineable/axe')).toMatchSnapshot()
   expect(itemTags.resolve('#minecraft:trapdoors')).toMatchSnapshot()
})

test('finds item in tag', async () => {
   const blockTags = loader.tagRegistry.registry('blocks')

   expect(blockTags.contains('#minecraft:mineable/axe', 'minecraft:note_block')).toBeTruthy()
   expect(blockTags.contains('#minecraft:mineable/axe', 'minecraft:oak_log')).toBeTruthy()
   expect(blockTags.contains('#minecraft:mineable/axe', 'minecraft:stripped_oak_log')).toBeTruthy()
   expect(blockTags.contains('#minecraft:mineable/axe', 'minecraft:chest')).toBeTruthy()

   expect(blockTags.contains('#minecraft:mineable/axe', 'minecraft:stone')).toBeFalsy()
})

test('finds tag in tag', async () => {
   const blockTags = loader.tagRegistry.registry('blocks')

   expect(blockTags.contains('#minecraft:mineable/axe', '#minecraft:logs')).toBeTruthy()
   expect(blockTags.contains('#minecraft:mineable/axe', '#minecraft:logs_that_burn')).toBeTruthy()

   expect(blockTags.contains('#minecraft:mineable/axe', '#minecraft:trapdoors')).toBeFalsy()
})
