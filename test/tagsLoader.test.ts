import { createResolver } from '@pssbletrngle/pack-resolver'
import PackLoader from '../src/loader/pack'
import createLogger from '../src/logger'

const logger = createLogger()
const loader = new PackLoader(logger)

beforeAll(async () => {
   const resolver = createResolver({ from: 'example' })
   await loader.loadFrom(resolver)
}, 10_000)

afterEach(() => {
   loader.clear()
})

test('loads tags correctly', async () => {
   const itemTags = loader.tags.registry('items')
   const blockTags = loader.tags.registry('blocks')

   expect(blockTags.list().length).toBe(259)
   expect(itemTags.list().length).toBe(302)

   expect(blockTags.get('minecraft:mineable/pickaxe')).toMatchSnapshot()
   expect(itemTags.get('minecraft:logs')).toMatchSnapshot()
})
