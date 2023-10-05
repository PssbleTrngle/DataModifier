import { createResolver } from '@pssbletrngle/pack-resolver'
import PackLoader from '../src/loader/pack'
import createLogger from '../src/logger'
import createTestAcceptor from './TestAcceptor'

let loader: PackLoader

beforeEach(async () => {
   const logger = createLogger()
   loader = new PackLoader(logger)
   const resolver = createResolver({ from: 'example' })
   await loader.loadFrom(resolver)
})

test('replaces ingredients', async () => {
   const acceptor = createTestAcceptor('1')

   loader.recipes.replaceIngredient('minecraft:redstone', {
      item: 'minecraft:emerald',
   })

   loader.emit(acceptor)

   expect(acceptor.paths().length).toBe(14)

   expect(acceptor.jsonAt('data/minecraft/recipe/piston.json')).toMatchSnapshot()
   expect(acceptor.jsonAt('data/minecraft/recipe/compass.json')).toMatchSnapshot()
})

test('replaces ingredients in create recipes', async () => {
   const acceptor = createTestAcceptor('2')

   loader.recipes.replaceIngredient('#forge:raw_materials/zinc', {
      tag: '#forge:raw_materials/iron',
   })

   loader.emit(acceptor)

   expect(acceptor.paths().length).toBe(4)

   expect(acceptor.jsonAt('data/create/recipe/crafting/materials/raw_zinc_block.json')).toMatchSnapshot()
   expect(acceptor.jsonAt('data/create/recipe/crushing/raw_zinc.json')).toMatchSnapshot()
   expect(acceptor.jsonAt('data/create/recipe/blasting/zinc_ingot_from_raw_ore.json')).toMatchSnapshot()
   expect(acceptor.jsonAt('data/create/recipe/smelting/zinc_ingot_from_raw_ore.json')).toMatchSnapshot()
})
