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

describe('loading of tags', () => {
   it('loads tags correctly', async () => {
      const itemTags = loader.tagRegistry('items')
      const blockTags = loader.tagRegistry('blocks')

      expect(blockTags.list().length).toBe(259)
      expect(itemTags.list().length).toBe(302)

      expect(blockTags.get('#minecraft:mineable/pickaxe')).toMatchSnapshot()
      expect(itemTags.get('#minecraft:logs')).toMatchSnapshot()
   })

   it('resolves tags correctly', async () => {
      const itemTags = loader.tagRegistry('items')
      const blockTags = loader.tagRegistry('blocks')

      expect(blockTags.resolve('#minecraft:mineable/axe')).toMatchSnapshot()
      expect(itemTags.resolve('#minecraft:trapdoors')).toMatchSnapshot()
   })
})

describe('tag contain tests', () => {
   it('finds item in tag', async () => {
      const blockTags = loader.tagRegistry('blocks')

      expect(blockTags.contains('#minecraft:mineable/axe', 'minecraft:note_block')).toBeTruthy()
      expect(blockTags.contains('#minecraft:mineable/axe', 'minecraft:oak_log')).toBeTruthy()
      expect(blockTags.contains('#minecraft:mineable/axe', 'minecraft:stripped_oak_log')).toBeTruthy()
      expect(blockTags.contains('#minecraft:mineable/axe', 'minecraft:chest')).toBeTruthy()

      expect(blockTags.contains('#minecraft:mineable/axe', 'minecraft:stone')).toBeFalsy()
   })

   it('finds tag in tag', async () => {
      const blockTags = loader.tagRegistry('blocks')

      expect(blockTags.contains('#minecraft:mineable/axe', '#minecraft:logs')).toBeTruthy()
      expect(blockTags.contains('#minecraft:mineable/axe', '#minecraft:logs_that_burn')).toBeTruthy()

      expect(blockTags.contains('#minecraft:mineable/axe', '#minecraft:trapdoors')).toBeFalsy()
   })
})
