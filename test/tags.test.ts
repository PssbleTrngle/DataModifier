import createTestAcceptor from './mock/TestAcceptor.js'
import setupLoader from './shared/loaderSetup'

const { logger, loader } = setupLoader({ include: ['data/*/tags/**/*.json'] })

describe('loading of tags', () => {
   it('loads tags correctly', async () => {
      const itemTags = loader.tagRegistry('items')
      const blockTags = loader.tagRegistry('blocks')

      expect(blockTags.list().length).toBe(259)
      expect(itemTags.list().length).toBe(302)

      expect(blockTags.get('#minecraft:mineable/pickaxe')).toMatchSnapshot('#mineable/pickaxe content')
      expect(itemTags.get('#minecraft:logs')).toMatchSnapshot('#logs content')
   })

   it('resolves tags correctly', async () => {
      const itemTags = loader.tagRegistry('items')
      const blockTags = loader.tagRegistry('blocks')

      expect(blockTags.resolve('#minecraft:mineable/axe')).toMatchSnapshot('resolved #mineable/axe entries')
      expect(itemTags.resolve('#minecraft:trapdoors')).toMatchSnapshot('resolved #trapdoors entries')
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

describe('adding of tag entries', () => {
   it('adds tag entries', async () => {
      const acceptor = createTestAcceptor()

      loader.tags.items.add('#minecraft:minable/axe', 'minecraft:obsidian')
      loader.tags.items.add('#minecraft:minable/axe', {
         value: 'create:brass_block',
         required: false,
      })

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('data/minecraft/tags/items/minable/axe.json')).toMatchSnapshot('#mineable/axe content')
   })

   it('adds tag entries to custom registries', async () => {
      const acceptor = createTestAcceptor()

      loader.registerRegistry('whatever/registry')
      loader.tags.add('whatever/registry', '#example:something', 'example:entry')

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('data/example/tags/whatever/registry/something.json')).toMatchSnapshot(
         '#example:something content'
      )
   })
})

describe('removal of tag entries', () => {
   it('removes tag entries using id', async () => {
      const acceptor = createTestAcceptor()

      loader.tags.blocks.remove('#minecraft:oak_logs', 'minecraft:oak_log')

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('data/minecraft/tags/blocks/oak_logs.json')).toMatchSnapshot('#oak_logs content')
   })

   it('removes tag entries using tag', async () => {
      const acceptor = createTestAcceptor()

      loader.tags.blocks.remove('#minecraft:mineable/axe', '#minecraft:logs')
      loader.tags.blocks.remove('#minecraft:guarded_by_piglins', '#minecraft:mineable/axe')
      loader.tags.blocks.remove('#minecraft:guarded_by_piglins', '#minecraft:mineable/pickaxe')

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('data/minecraft/tags/blocks/mineable/axe.json')).toMatchSnapshot('modified #minable/axe')
      expect(acceptor.jsonAt('data/minecraft/tags/blocks/guarded_by_piglins.json')).toMatchSnapshot(
         'modified #guarded_by_piglins'
      )
   })

   it('removes tag entries using regex', async () => {
      const acceptor = createTestAcceptor()

      loader.tags.blocks.remove('#minecraft:birch_logs', /minecraft:stripped_.+/)

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('data/minecraft/tags/blocks/birch_logs.json')).toMatchSnapshot('modified #birch_logs')
   })

   it('removes tag entries using predicate', async () => {
      const acceptor = createTestAcceptor()

      loader.tags.blocks.remove('#minecraft:guarded_by_piglins', it => it.includes('gold'))

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('data/minecraft/tags/blocks/guarded_by_piglins.json')).toMatchSnapshot(
         'modified #guarded_by_piglins'
      )
   })
})
