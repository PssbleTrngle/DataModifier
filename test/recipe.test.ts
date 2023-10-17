import { EMPTY_RECIPE } from '../src/emit/recipe.js'
import { ShapedRecipeDefinition } from '../src/parser/recipe/vanilla/shaped.js'
import createTestAcceptor from './mock/TestAcceptor.js'
import setupLoader from './shared/loaderSetup.js'

const { logger, loader } = setupLoader({ include: ['data/**/*.json'] })

it('has no unknown recipe loaders', () => {
   expect(loader.recipeLoader.unknownRecipeTypes()).toMatchObject([])
})

it('does not encounter any errors', () => {
   expect(logger.warn).not.toHaveBeenCalled()
   expect(logger.error).not.toHaveBeenCalled()
})

describe('recipe ingredient replacement', () => {
   it('replaces ingredients', async () => {
      const acceptor = createTestAcceptor()

      loader.recipes.replaceIngredient('minecraft:redstone', {
         item: 'minecraft:emerald',
      })

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('data/minecraft/recipe/piston.json')).toMatchSnapshot('modified piston recipe')
      expect(acceptor.jsonAt('data/minecraft/recipe/compass.json')).toMatchSnapshot('modified compass recipe')

      expect(acceptor.paths()).toMatchSnapshot('recipes including redstone as an ingredient')
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

      expect(acceptor.jsonAt('data/minecraft/recipe/piston.json')).toMatchSnapshot('modified piston recipe')
      expect(acceptor.jsonAt('data/minecraft/recipe/note_block.json')).toMatchSnapshot('modified note_block recipe')
      expect(acceptor.jsonAt('data/minecraft/recipe/compass.json')).toBeNull()
   })

   it('replaces ingredients in create recipes', async () => {
      const acceptor = createTestAcceptor()

      loader.recipes.replaceIngredient('#forge:raw_materials/zinc', {
         tag: '#forge:raw_materials/iron',
      })

      await loader.emit(acceptor)

      expect(acceptor.paths().length).toBe(4)

      expect(acceptor.jsonAt('data/create/recipe/crafting/materials/raw_zinc_block.json')).toMatchSnapshot(
         'modified create:raw_zinc_block recipe'
      )
      expect(acceptor.jsonAt('data/create/recipe/crushing/raw_zinc.json')).toMatchSnapshot(
         'modified create:raw_zinc recipe'
      )
      expect(acceptor.jsonAt('data/create/recipe/blasting/zinc_ingot_from_raw_ore.json')).toMatchSnapshot(
         'modified create:zinc_ingot_from_raw_ore recipe'
      )
      expect(acceptor.jsonAt('data/create/recipe/smelting/zinc_ingot_from_raw_ore.json')).toMatchSnapshot(
         'modified create:zinc_ingot_from_raw_ore recipe'
      )
   })
})

describe('recipe removal', () => {
   it('removes recipes with id filter', async () => {
      const acceptor = createTestAcceptor()

      loader.recipes.removeRecipe({
         id: /minecraft:.*piston/,
      })

      await loader.emit(acceptor)

      expect(acceptor.paths().length).toBe(2)

      expect(acceptor.jsonAt('data/minecraft/recipe/piston.json')).toMatchObject(EMPTY_RECIPE)
      expect(acceptor.jsonAt('data/minecraft/recipe/sticky_piston.json')).toMatchObject(EMPTY_RECIPE)
   })

   it('removes recipes with type filter', async () => {
      const acceptor = createTestAcceptor()

      loader.recipes.removeRecipe({
         type: 'minecraft:smelting',
      })

      await loader.emit(acceptor)

      expect(acceptor.paths().length).toBe(118)
   })

   it('removes recipes with result filter', async () => {
      const acceptor = createTestAcceptor()

      loader.recipes.removeRecipe({
         output: 'minecraft:cooked_beef',
      })

      await loader.emit(acceptor)

      expect(acceptor.paths().length).toBe(3)

      expect(acceptor.jsonAt('data/minecraft/recipe/cooked_beef.json')).toMatchObject(EMPTY_RECIPE)
      expect(acceptor.jsonAt('data/minecraft/recipe/cooked_beef_from_smoking.json')).toMatchObject(EMPTY_RECIPE)
      expect(acceptor.jsonAt('data/minecraft/recipe/cooked_beef_from_campfire_cooking.json')).toMatchObject(
         EMPTY_RECIPE
      )
   })
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
