import RecipeEmitter from '../src/emit/recipe'
import PackLoader from '../src/loader/pack'
import { ShapedRecipeDefinition } from '../src/parser/recipe/vanilla/shaped'
import createTestAcceptor from './mock/TestAcceptor'
import createTestLogger from './mock/TestLogger'
import createTestResolver from './mock/TestResolver'

const logger = createTestLogger()
const loader = new PackLoader(logger)

beforeAll(async () => {
   const resolver = createTestResolver()
   await loader.loadFrom(resolver)
}, 10_000)

afterEach(() => {
   loader.clear()
})

it('has no unknown recipe loaders', () => {
   expect(logger.warn).not.toBeCalled()
   expect(logger.error).not.toBeCalled()
})

it('replaces ingredients', async () => {
   const acceptor = createTestAcceptor()

   loader.recipes.replaceIngredient('minecraft:redstone', {
      item: 'minecraft:emerald',
   })

   await loader.emit(acceptor)

   expect(acceptor.paths().length).toBe(38)

   expect(acceptor.jsonAt('data/minecraft/recipe/piston.json')).toMatchSnapshot()
   expect(acceptor.jsonAt('data/minecraft/recipe/compass.json')).toMatchSnapshot()
})

it('replaces ingredients with additional input filter', async () => {
   const acceptor = createTestAcceptor()

   loader.recipes.replaceIngredient(
      'minecraft:redstone',
      {
         item: 'minecraft:emerald',
      },
      {
         input: '#minecraft:planks',
      }
   )

   await loader.emit(acceptor)

   expect(acceptor.paths().length).toBe(2)

   expect(acceptor.jsonAt('data/minecraft/recipe/piston.json')).toMatchSnapshot()
   expect(acceptor.jsonAt('data/minecraft/recipe/note_block.json')).toMatchSnapshot()
   expect(acceptor.jsonAt('data/minecraft/recipe/compass.json')).toBeNull()
})

it('replaces ingredients in create recipes', async () => {
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

it('removes recipes with id filter', async () => {
   const acceptor = createTestAcceptor()

   loader.recipes.removeRecipe({
      id: /minecraft:.*piston/,
   })

   await loader.emit(acceptor)

   expect(acceptor.paths().length).toBe(2)

   expect(acceptor.jsonAt('data/minecraft/recipe/piston.json')).toMatchObject(RecipeEmitter.EMPTY_RECIPE)
   expect(acceptor.jsonAt('data/minecraft/recipe/sticky_piston.json')).toMatchObject(RecipeEmitter.EMPTY_RECIPE)
})

it('creates custom recipes', async () => {
   const acceptor = createTestAcceptor()

   const recipe: ShapedRecipeDefinition = {
      type: 'minecraft:shaped',
      key: {
         A: {
            item: 'minecraft:diamond',
         },
         B: {
            tag: 'minecraft:iron_ores',
         },
      },
      result: {
         item: 'minecraft:command_block',
      },
      pattern: ['A ', ' B'],
   }

   loader.recipes.addRecipe('example:custom', recipe)

   await loader.emit(acceptor)

   expect(acceptor.jsonAt('data/example/recipe/custom.json')).toMatchObject(recipe)
})
