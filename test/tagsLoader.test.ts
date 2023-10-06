import { createResolver } from '@pssbletrngle/pack-resolver'
import PackLoader from '../src/loader/pack'
import createTestLogger from './mock/TestLogger'

const logger = createTestLogger()
const loader = new PackLoader(logger)

beforeAll(async () => {
   const resolver = createResolver({ from: 'example', include: ['data/*/tags/**/*.json'] })
   await loader.loadFrom(resolver)
}, 10_000)

afterEach(() => {
   loader.clear()
})

test('loads tags correctly', async () => {
   const itemTags = loader.tagRegistry('items')
   const blockTags = loader.tagRegistry('blocks')

   expect(blockTags.list().length).toBe(259)
   expect(itemTags.list().length).toBe(302)

   expect(blockTags.get('minecraft:mineable/pickaxe')).toMatchSnapshot()
   expect(itemTags.get('minecraft:logs')).toMatchSnapshot()
})

test('resolves tags correctly', async () => {
   const itemTags = loader.tagRegistry('items')
   const blockTags = loader.tagRegistry('blocks')

   expect(blockTags.resolve('minecraft:mineable/axe')).toMatchSnapshot()
   expect(itemTags.resolve('minecraft:trapdoors')).toMatchSnapshot()
})
