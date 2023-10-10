import PackLoader from '../src/loader/pack'
import createTestAcceptor from './mock/TestAcceptor'
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

test('adds tag entries', async () => {
   const acceptor = createTestAcceptor()

   loader.tags.items.add('#minecraft:minable/axe', 'minecraft:obsidian')
   loader.tags.items.add('#minecraft:minable/axe', {
      value: 'create:brass_block',
      required: false,
   })

   await loader.emit(acceptor)

   expect(acceptor.jsonAt('data/minecraft/tags/items/minable/axe.json')).toMatchSnapshot()
})

test('adds tag entries to custom registries', async () => {
   const acceptor = createTestAcceptor()

   loader.registerRegistry('whatever/registry')
   loader.tags.add('whatever/registry', '#example:something', 'example:entry')

   await loader.emit(acceptor)

   expect(acceptor.jsonAt('data/example/tags/whatever/registry/something.json')).toMatchSnapshot()
})

test('removes tag entries using id', async () => {
   const acceptor = createTestAcceptor()

   loader.tags.blocks.remove('#minecraft:oak_logs', 'minecraft:oak_log')

   await loader.emit(acceptor)

   expect(acceptor.jsonAt('data/minecraft/tags/blocks/oak_logs.json')).toMatchSnapshot()
})

test('removes tag entries using tag', async () => {
   const acceptor = createTestAcceptor()

   loader.tags.blocks.remove('#minecraft:mineable/axe', '#minecraft:logs')
   loader.tags.blocks.remove('#minecraft:guarded_by_piglins', '#minecraft:mineable/axe')
   loader.tags.blocks.remove('#minecraft:guarded_by_piglins', '#minecraft:mineable/pickaxe')

   await loader.emit(acceptor)

   expect(acceptor.jsonAt('data/minecraft/tags/blocks/mineable/axe.json')).toMatchSnapshot()
   expect(acceptor.jsonAt('data/minecraft/tags/blocks/guarded_by_piglins.json')).toMatchSnapshot()
})

test('removes tag entries using regex', async () => {
   const acceptor = createTestAcceptor()

   loader.tags.blocks.remove('#minecraft:birch_logs', /minecraft:stripped_.+/)

   await loader.emit(acceptor)

   expect(acceptor.jsonAt('data/minecraft/tags/blocks/birch_logs.json')).toMatchSnapshot()
})

test('removes tag entries using predicate', async () => {
   const acceptor = createTestAcceptor()

   loader.tags.blocks.remove('#minecraft:guarded_by_piglins', it => it.includes('gold'))

   await loader.emit(acceptor)

   expect(acceptor.jsonAt('data/minecraft/tags/blocks/guarded_by_piglins.json')).toMatchSnapshot()
})
