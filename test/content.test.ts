import { describe, expect, it } from 'vitest'
import createTestAcceptor from './mock/TestAcceptor.js'
import setupLoader from './shared/loaderSetup.js'

const { loader } = setupLoader({ load: false })

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

      loader.content.items.blockItem('example:ruby_block', {
         rarity: 'rare',
         block: blocks => blocks.basic({ material: 'metal' }, { loot: false }),
      })

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('content/example/item/ruby_block.json')).toMatchSnapshot('basic item definition')
      expect(acceptor.jsonAt('assets/example/models/item/ruby_block.json')).toMatchSnapshot('basic item model')

      expect(acceptor.jsonAt('data/example/loot_tables/blocks/ruby_block.json')).toBeNull()
      expect(acceptor.jsonAt('content/example/block/ruby_block.json')).toBeNull()
      expect(acceptor.jsonAt('assets/example/blockstates/ruby_block.json')).toMatchSnapshot('included blockstate')
      expect(acceptor.jsonAt('assets/example/models/block/ruby_block.json')).toMatchSnapshot('included block model')
   })

   it('uses custom definition types', async () => {
      const acceptor = createTestAcceptor()

      loader.content.blocks.basic('example:sapphire_block', { material: 'stone', type: 'example_block' })
      loader.content.items.basic('example:sapphire', { type: 'example' })
      loader.content.items.blockItem('example:sapphire_ore', {
         type: 'example_block_item',
         block: blocks => blocks.basic({ material: 'stone', type: 'example_block' }),
      })

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('content/example/block/sapphire_block.json')).toMatchObject({ type: 'example_block' })
      expect(acceptor.jsonAt('content/example/item/sapphire.json')).toMatchObject({ type: 'example' })
      expect(acceptor.jsonAt('content/example/item/sapphire_ore.json')).toMatchObject({
         type: 'example_block_item',
         block: {
            type: 'example_block',
         },
      })
   })

   it('uses custom definition types for nested block', async () => {
      const acceptor = createTestAcceptor()

      loader.content.blocks.basic('example:sapphire_block', { material: 'stone', type: 'example_block' })
      loader.content.items.basic('example:sapphire', { type: 'example' })
      loader.content.items.blockItem('example:sapphire_ore', {
         type: 'example_block_item',
         block: blocks =>
            blocks.add({
               type: 'example_block',
               properties: {
                  material: 'ice',
               },
            }),
      })

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('content/example/block/sapphire_block.json')).toMatchObject({ type: 'example_block' })
      expect(acceptor.jsonAt('content/example/item/sapphire.json')).toMatchObject({ type: 'example' })
      expect(acceptor.jsonAt('content/example/item/sapphire_ore.json')).toMatchObject({
         type: 'example_block_item',
         block: {
            type: 'example_block',
         },
      })
   })

   it('correctly resolves copy reference for block properties', async () => {
      const acceptor = createTestAcceptor()

      loader.content.blocks.basic('example:ruby_ore', { material: 'stone', copy: 'minecraft:emerald_ore' })

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('content/example/block/ruby_ore.json')).toMatchSnapshot('block definition using reference for properties')
   })
})
