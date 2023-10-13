import { PackLoader } from '../src/index.js'
import createTestLogger from './mock/TestLogger.js'
import createTestResolver from './mock/TestResolver.js'
import createTestAcceptor from './mock/TestAcceptor.js'
import { createIngredient } from '../src/common/ingredient.js'
import { createResult } from '../src/common/result.js'
import { tryCatching } from '../src/error.js'

const logger = createTestLogger()
const loader = new PackLoader(logger)
beforeAll(async () => {
   const resolver = createTestResolver()
   await loader.loadFrom(resolver)
}, 10_000)

afterEach(() => {
   loader.clear()
   logger.reset()
})

describe('tests regarding ingredient/result shapes', () => {
   it('warns about unknown ingredient shape', async () => {
      tryCatching(logger, () => createIngredient(['test', { whatever: true }]))
      tryCatching(logger, () => createIngredient({}))
      tryCatching(logger, () => createIngredient(10))
      tryCatching(logger, () => createIngredient(null))

      expect(logger.warn).toHaveBeenCalledTimes(4)
   })

   it('warns about unknown result shape', async () => {
      tryCatching(logger, () => createResult(['test', { whatever: true }]))
      tryCatching(logger, () => createResult({}))
      tryCatching(logger, () => createResult(10))
      tryCatching(logger, () => createResult(null))
      tryCatching(logger, () => createResult({ tag: 'minecraft:pickaxes' }))
      tryCatching(logger, () => createResult({ fluidTag: 'minecraft:fluid' }))
      tryCatching(logger, () => createResult({ blockTag: 'minecraft:stone' }))

      expect(logger.warn).toHaveBeenCalledTimes(7)
   })

   it('does not encounter any unknown ingredient shapes', async () => {
      const acceptor = createTestAcceptor()

      loader.recipes.replaceIngredient('minecraft:coal', { item: 'minecraft:diamond' })
      loader.recipes.replaceIngredient({ item: 'minecraft:coal' }, { item: 'minecraft:diamond' })
      loader.recipes.replaceIngredient({ fluid: 'minecraft:water' }, { item: 'minecraft:lava' })
      loader.recipes.replaceIngredient({ block: 'minecraft:coal_block' }, { item: 'minecraft:diamond_block' })

      await loader.emit(acceptor)

      expect(logger.warn).not.toHaveBeenCalled()
      expect(logger.error).not.toHaveBeenCalled()
   })

   it('does not encounter any unknown result shapes', async () => {
      const acceptor = createTestAcceptor()

      loader.recipes.replaceResult('minecraft:coal', { item: 'minecraft:diamond' })
      loader.recipes.replaceResult({ item: 'minecraft:coal' }, { item: 'minecraft:diamond' })
      loader.recipes.replaceResult({ fluid: 'minecraft:water' }, { item: 'minecraft:lava' })
      loader.recipes.replaceResult({ block: 'minecraft:coal_block' }, { item: 'minecraft:diamond_block' })

      await loader.emit(acceptor)

      expect(logger.warn).not.toHaveBeenCalled()
      expect(logger.error).not.toHaveBeenCalled()
   })
})

describe('ingredient tests applying to items', () => {
   it('matches ingredients using regex', () => {
      const predicate = loader.resolveIngredientTest(/.+:spruce_.+/)

      expect(predicate({ item: 'minecraft:spruce_log' })).toBeTruthy()
      expect(predicate({ item: 'spruce_fence' })).toBeTruthy()
      expect(predicate({ item: 'a-mod:spruce_something' })).toBeTruthy()
      expect(predicate({ tag: 'minecraft:spruce_wood' })).toBeTruthy()

      expect(predicate({ item: 'minecraft:stripped_spruce_log' })).toBeFalsy()
      expect(predicate({ item: 'something:else' })).toBeFalsy()
      expect(predicate({ tag: 'minecraft:stripped_spruce_wood' })).toBeFalsy()
   })

   it('matches ingredients using item id', () => {
      const predicate = loader.resolveIngredientTest('minecraft:obsidian')

      expect(predicate({ item: 'minecraft:obsidian' })).toBeTruthy()

      expect(predicate({ item: 'minecraft:obsidian_pillar' })).toBeFalsy()
      expect(predicate({ item: 'example:obsidian' })).toBeFalsy()
      expect(predicate({ item: 'minecraft:stone' })).toBeFalsy()
      expect(predicate({ tag: 'minecraft:obsidian' })).toBeFalsy()
      expect(predicate({ tag: 'minecraft:mineable/pickaxe' })).toBeFalsy()
   })

   it('matches ingredients using item tag', () => {
      const predicate = loader.resolveIngredientTest('#minecraft:logs')

      expect(predicate({ item: 'minecraft:oak_log' })).toBeTruthy()
      expect(predicate({ item: 'stripped_birch_log' })).toBeTruthy()
      expect(predicate({ tag: 'minecraft:logs_that_burn' })).toBeTruthy()

      expect(predicate({ item: 'minecraft:stone' })).toBeFalsy()
      expect(predicate({ tag: 'minecraft:mineable/axe' })).toBeFalsy()
   })

   it('matches ingredients using item ingredient', () => {
      const predicate = loader.resolveIngredientTest({ tag: 'minecraft:piglin_loved' })

      expect(predicate({ item: 'minecraft:golden_sword' })).toBeTruthy()
      expect(predicate({ item: 'golden_apple' })).toBeTruthy()

      expect(predicate({ item: 'minecraft:ice' })).toBeFalsy()
      expect(predicate({ item: 'blackstone' })).toBeFalsy()
   })

   it('matches ingredients using tag ingredient', () => {
      const predicate = loader.resolveIngredientTest({ item: 'minecraft:mangrove_leaves' })

      expect(predicate({ item: 'minecraft:mangrove_leaves' })).toBeTruthy()
      expect(predicate({ item: 'mangrove_leaves' })).toBeTruthy()

      expect(predicate({ item: 'minecraft:mangrove_sapling' })).toBeFalsy()
   })
})

describe('ingredient tests applying to fluids', () => {
   it('matches fluid ingredients', () => {
      const predicate = loader.resolveIngredientTest({ fluid: 'minecraft:water' })

      expect(predicate({ fluid: 'minecraft:water' })).toBeTruthy()

      expect(predicate({ fluid: 'minecraft:lava' })).toBeFalsy()
      expect(predicate({ item: 'minecraft:water' })).toBeFalsy()
      expect(predicate({ fluidTag: 'minecraft:water' })).toBeFalsy()
      expect(predicate({ tag: 'minecraft:water' })).toBeFalsy()
   })

   it('matches fluid ingredients using tag', () => {
      const predicate = loader.resolveIngredientTest({ fluidTag: 'minecraft:water' })

      expect(predicate({ fluid: 'minecraft:water' })).toBeTruthy()
      expect(predicate({ fluid: 'minecraft:flowing_water' })).toBeTruthy()
      expect(predicate({ fluidTag: 'minecraft:water' })).toBeTruthy()

      expect(predicate({ fluid: 'minecraft:lava' })).toBeFalsy()
      expect(predicate({ fluidTag: 'minecraft:lava' })).toBeFalsy()
      expect(predicate({ item: 'minecraft:water' })).toBeFalsy()
      expect(predicate({ tag: 'minecraft:water' })).toBeFalsy()
   })
})

describe('ingredient tests applying to blocks', () => {
   it('matches block ingredients', () => {
      const predicate = loader.resolveIngredientTest({ block: 'minecraft:water' })

      expect(predicate({ block: 'minecraft:water' })).toBeTruthy()

      expect(predicate({ fluid: 'minecraft:lava' })).toBeFalsy()
      expect(predicate({ item: 'minecraft:water' })).toBeFalsy()
      expect(predicate({ fluidTag: 'minecraft:water' })).toBeFalsy()
      expect(predicate({ tag: 'minecraft:water' })).toBeFalsy()
   })

   it('matches block ingredients using tag', () => {
      const predicate = loader.resolveIngredientTest({ blockTag: 'minecraft:base_stone_overworld' })

      expect(predicate({ block: 'minecraft:stone' })).toBeTruthy()
      expect(predicate({ block: 'minecraft:andesite' })).toBeTruthy()
      expect(predicate({ blockTag: 'minecraft:base_stone_overworld' })).toBeTruthy()

      expect(predicate({ block: 'minecraft:obsidian' })).toBeFalsy()
      expect(predicate({ fluid: 'minecraft:stone' })).toBeFalsy()
      expect(predicate({ blockTag: 'minecraft:mineable/pickaxe' })).toBeFalsy()
      expect(predicate({ item: 'minecraft:stone' })).toBeFalsy()
      expect(predicate({ tag: 'minecraft:stone' })).toBeFalsy()
   })
})

it('matches nested ingredients in array', () => {
   const predicate = loader.resolveIngredientTest('#minecraft:logs')

   expect(predicate(['minecraft:stone', 'minecraft:oak_log'])).toBeTruthy()
   expect(predicate(['minecraft:stone', '#minecraft:logs_that_burn'])).toBeTruthy()

   expect(predicate(['minecraft:obsidian', 'minecraft:netherrack'])).toBeFalsy()
})

it('matches ingredients using predicate', () => {
   const predicate = loader.resolveIngredientTest(it => {
      if ('tag' in it) return it.tag.includes('stone')
      if ('item' in it) return it.item.includes('wool')
      return false
   })

   expect(predicate({ item: 'minecraft:red_wool' })).toBeTruthy()
   expect(predicate({ item: 'green_wool' })).toBeTruthy()
   expect(predicate({ tag: 'example:stone_tools' })).toBeTruthy()

   expect(predicate({ item: 'minecraft:stone_pickaxe' })).toBeFalsy()
   expect(predicate({ item: 'stone_pickaxe' })).toBeFalsy()
   expect(predicate({ tag: 'minecraft:pink_wool' })).toBeFalsy()
})
