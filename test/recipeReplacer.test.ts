import { createResolver } from '@pssbletrngle/pack-resolver'
import PackLoader from '../src/loader/pack'
import createTestAcceptor from './mock/TestAcceptor'
import createTestLogger from './mock/TestLogger'

const logger = createTestLogger()
const loader = new PackLoader(logger)

beforeAll(async () => {
   const resolver = createResolver({ from: 'example' })
   await loader.loadFrom(resolver)
}, 10_000)

afterEach(() => {
   loader.clear()
})

test('has no unknown recipe loaders', () => {
   expect(logger.warnings()).toBe([])
   expect(logger.errors()).toBe([])
})

test('replaces ingredients', async () => {
   const acceptor = createTestAcceptor()

   loader.recipes.replaceIngredient('minecraft:redstone', {
      item: 'minecraft:emerald',
   })

   await loader.emit(acceptor)

   expect(acceptor.paths().length).toBe(34)

   expect(acceptor.jsonAt('data/minecraft/recipe/piston.json')).toMatchSnapshot()
   expect(acceptor.jsonAt('data/minecraft/recipe/compass.json')).toMatchSnapshot()
})

test('replaces ingredients in create recipes', async () => {
   const acceptor = createTestAcceptor()

   loader.recipes.replaceIngredient('#forge:raw_materials/zinc', {
      tag: '#forge:raw_materials/iron',
   })

   await loader.emit(acceptor)

   expect(acceptor.paths().length).toBe(4)

   expect(acceptor.jsonAt('data/create/recipe/crafting/materials/raw_zinc_block.json')).toMatchSnapshot()
   expect(acceptor.jsonAt('data/create/recipe/crushing/raw_zinc.json')).toMatchSnapshot()
   expect(acceptor.jsonAt('data/create/recipe/blasting/zinc_ingot_from_raw_ore.json')).toMatchSnapshot()
   expect(acceptor.jsonAt('data/create/recipe/smelting/zinc_ingot_from_raw_ore.json')).toMatchSnapshot()
})
