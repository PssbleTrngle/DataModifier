import setupLoader from './shared/loaderSetup.js'
import createTestAcceptor from './mock/TestAcceptor.js'

const { loader } = setupLoader()

describe('integration with content packs mod', () => {
   it('generates additional resources for block definitions', async () => {
      const acceptor = createTestAcceptor()

      loader.content.blocks.basic('example:ruby_ore', { material: 'stone' })

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('content/example/block/ruby_ore.json')).toMatchSnapshot('basic block definition')
      expect(acceptor.jsonAt('data/example/loot_tables/blocks/ruby_ore.json')).toMatchSnapshot('basic loot table')
      expect(acceptor.jsonAt('assets/example/blockstates/ruby_ore.json')).toMatchSnapshot('basic blockstate')
      expect(acceptor.jsonAt('assets/example/models/block/ruby_ore.json')).toMatchSnapshot('basic block model')
   })

   it('generates additional resources for item definitions', async () => {
      const acceptor = createTestAcceptor()

      loader.content.items.basic('example:ruby', { rarity: 'rare', stack_size: 24 })

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('content/example/item/ruby.json')).toMatchSnapshot('basic item definition')
      expect(acceptor.jsonAt('assets/example/models/item/ruby.json')).toMatchSnapshot('basic item model')
   })

   it('generates block resources for block item definitions', async () => {
      const acceptor = createTestAcceptor()

      const block = loader.content.blocks.basic('example:ruby_block', { material: 'metal' }, { loot: false })
      loader.content.items.blockItem('example:ruby_block', { rarity: 'rare', block })

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('content/example/item/ruby_block.json')).toMatchSnapshot('basic item definition')
      expect(acceptor.jsonAt('assets/example/models/item/ruby_block.json')).toMatchSnapshot('basic item model')

      expect(acceptor.jsonAt('data/example/loot_tables/blocks/ruby_block.json')).toBeNull()
      expect(acceptor.jsonAt('content/example/block/ruby_block.json')).toBeNull()
      expect(acceptor.jsonAt('assets/example/blockstates/ruby_block.json')).toMatchSnapshot('included blockstate')
      expect(acceptor.jsonAt('assets/example/models/block/ruby_block.json')).toMatchSnapshot('included block model')
   })
})
