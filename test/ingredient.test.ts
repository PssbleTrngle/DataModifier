import { PackLoader } from '../src'
import createTestLogger from './mock/TestLogger'
import createTestResolver from './mock/TestResolver'
import createTestAcceptor from './mock/TestAcceptor'
import { createIngredient } from '../src/common/ingredient'
import { createResult, Result } from '../src/common/result'
import { tryCatching } from '../src/error'

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

      expect(logger.warn).toBeCalledTimes(4)
   })

   it('warns about unknown result shape', async () => {
      tryCatching(logger, () => createResult(['test', { whatever: true }] as any as Result))
      tryCatching(logger, () => createResult({}))
      tryCatching(logger, () => createResult(10))
      tryCatching(logger, () => createResult(null))
      tryCatching(logger, () => createResult({ tag: 'minecraft:pickaxes' }))
      tryCatching(logger, () => createResult({ fluidTag: 'minecraft:fluid' }))
      tryCatching(logger, () => createResult({ blockTag: 'minecraft:stone' }))

      expect(logger.warn).toBeCalledTimes(7)
   })

   it('does not encounter any unknown ingredient shapes', async () => {
      const acceptor = createTestAcceptor()

      loader.recipes.replaceIngredient('minecraft:coal', { item: 'minecraft:diamond' })
      loader.recipes.replaceIngredient({ item: 'minecraft:coal' }, { item: 'minecraft:diamond' })
      loader.recipes.replaceIngredient({ fluid: 'minecraft:water' }, { item: 'minecraft:lava' })
      loader.recipes.replaceIngredient({ block: 'minecraft:coal_block' }, { item: 'minecraft:diamond_block' })

      await loader.emit(acceptor)

      expect(logger.warn).not.toBeCalled()
      expect(logger.error).not.toBeCalled()
   })

   it('does not encounter any unknown result shapes', async () => {
      const acceptor = createTestAcceptor()

      loader.recipes.replaceResult('minecraft:coal', { item: 'minecraft:diamond' })
      loader.recipes.replaceResult({ item: 'minecraft:coal' }, { item: 'minecraft:diamond' })
      loader.recipes.replaceResult({ fluid: 'minecraft:water' }, { item: 'minecraft:lava' })
      loader.recipes.replaceResult({ block: 'minecraft:coal_block' }, { item: 'minecraft:diamond_block' })

      await loader.emit(acceptor)

      expect(logger.warn).not.toBeCalled()
      expect(logger.error).not.toBeCalled()
   })
})

it('matches ingredients using regex', () => {
   const predicate = loader.resolveIngredientTest(/.+:spruce_.+/)

   expect(predicate({ item: 'minecraft:spruce_log' }, logger)).toBeTruthy()
   expect(predicate({ item: 'spruce_fence' }, logger)).toBeTruthy()
   expect(predicate({ item: 'a-mod:spruce_something' }, logger)).toBeTruthy()
   expect(predicate({ tag: 'minecraft:spruce_wood' }, logger)).toBeTruthy()

   expect(predicate({ item: 'minecraft:stripped_spruce_log' }, logger)).toBeFalsy()
   expect(predicate({ item: 'something:else' }, logger)).toBeFalsy()
   expect(predicate({ tag: 'minecraft:stripped_spruce_wood' }, logger)).toBeFalsy()
})

it('matches ingredients using item id', () => {
   const predicate = loader.resolveIngredientTest('minecraft:obsidian')

   expect(predicate({ item: 'minecraft:obsidian' }, logger)).toBeTruthy()

   expect(predicate({ item: 'minecraft:obsidian_pillar' }, logger)).toBeFalsy()
   expect(predicate({ item: 'example:obsidian' }, logger)).toBeFalsy()
   expect(predicate({ item: 'minecraft:stone' }, logger)).toBeFalsy()
   expect(predicate({ tag: 'minecraft:obsidian' }, logger)).toBeFalsy()
   expect(predicate({ tag: 'minecraft:mineable/pickaxe' }, logger)).toBeFalsy()
})

it('matches ingredients using item tag', () => {
   const predicate = loader.resolveIngredientTest('#minecraft:logs')

   expect(predicate({ item: 'minecraft:oak_log' }, logger)).toBeTruthy()
   expect(predicate({ item: 'stripped_birch_log' }, logger)).toBeTruthy()
   expect(predicate({ tag: 'minecraft:logs_that_burn' }, logger)).toBeTruthy()

   expect(predicate({ item: 'minecraft:stone' }, logger)).toBeFalsy()
   expect(predicate({ tag: 'minecraft:mineable/axe' }, logger)).toBeFalsy()
})

it('matches ingredients using item ingredient', () => {
   const predicate = loader.resolveIngredientTest({ tag: 'minecraft:piglin_loved' })

   expect(predicate({ item: 'minecraft:golden_sword' }, logger)).toBeTruthy()
   expect(predicate({ item: 'golden_apple' }, logger)).toBeTruthy()

   expect(predicate({ item: 'minecraft:ice' }, logger)).toBeFalsy()
   expect(predicate({ item: 'blackstone' }, logger)).toBeFalsy()
})

it('matches ingredients using tag ingredient', () => {
   const predicate = loader.resolveIngredientTest({ item: 'minecraft:mangrove_leaves' })

   expect(predicate({ item: 'minecraft:mangrove_leaves' }, logger)).toBeTruthy()
   expect(predicate({ item: 'mangrove_leaves' }, logger)).toBeTruthy()

   expect(predicate({ item: 'minecraft:mangrove_sapling' }, logger)).toBeFalsy()
})

it('matches ingredients using predicate', () => {
   const predicate = loader.resolveIngredientTest(it => {
      if ('tag' in it) return it.tag.includes('stone')
      if ('item' in it) return it.item.includes('wool')
      return false
   })

   expect(predicate({ item: 'minecraft:red_wool' }, logger)).toBeTruthy()
   expect(predicate({ item: 'green_wool' }, logger)).toBeTruthy()
   expect(predicate({ tag: 'example:stone_tools' }, logger)).toBeTruthy()

   expect(predicate({ item: 'minecraft:stone_pickaxe' }, logger)).toBeFalsy()
   expect(predicate({ item: 'stone_pickaxe' }, logger)).toBeFalsy()
   expect(predicate({ tag: 'minecraft:pink_wool' }, logger)).toBeFalsy()
})

it('matches fluid ingredients', () => {
   const predicate = loader.resolveIngredientTest({ fluid: 'minecraft:water' })

   expect(predicate({ fluid: 'minecraft:water' }, logger)).toBeTruthy()

   expect(predicate({ fluid: 'minecraft:lava' }, logger)).toBeFalsy()
   expect(predicate({ item: 'minecraft:water' }, logger)).toBeFalsy()
   expect(predicate({ fluidTag: 'minecraft:water' }, logger)).toBeFalsy()
   expect(predicate({ tag: 'minecraft:water' }, logger)).toBeFalsy()
})

it('matches fluid ingredients using tag', () => {
   const predicate = loader.resolveIngredientTest({ fluidTag: 'minecraft:water' })

   expect(predicate({ fluid: 'minecraft:water' }, logger)).toBeTruthy()
   expect(predicate({ fluid: 'minecraft:flowing_water' }, logger)).toBeTruthy()
   expect(predicate({ fluidTag: 'minecraft:water' }, logger)).toBeTruthy()

   expect(predicate({ fluid: 'minecraft:lava' }, logger)).toBeFalsy()
   expect(predicate({ fluidTag: 'minecraft:lava' }, logger)).toBeFalsy()
   expect(predicate({ item: 'minecraft:water' }, logger)).toBeFalsy()
   expect(predicate({ tag: 'minecraft:water' }, logger)).toBeFalsy()
})

it('matches block ingredients', () => {
   const predicate = loader.resolveIngredientTest({ block: 'minecraft:water' })

   expect(predicate({ block: 'minecraft:water' }, logger)).toBeTruthy()

   expect(predicate({ fluid: 'minecraft:lava' }, logger)).toBeFalsy()
   expect(predicate({ item: 'minecraft:water' }, logger)).toBeFalsy()
   expect(predicate({ fluidTag: 'minecraft:water' }, logger)).toBeFalsy()
   expect(predicate({ tag: 'minecraft:water' }, logger)).toBeFalsy()
})

it('matches block ingredients using tag', () => {
   const predicate = loader.resolveIngredientTest({ blockTag: 'minecraft:base_stone_overworld' })

   expect(predicate({ block: 'minecraft:stone' }, logger)).toBeTruthy()
   expect(predicate({ block: 'minecraft:andesite' }, logger)).toBeTruthy()
   expect(predicate({ blockTag: 'minecraft:base_stone_overworld' }, logger)).toBeTruthy()

   expect(predicate({ block: 'minecraft:obsidian' }, logger)).toBeFalsy()
   expect(predicate({ fluid: 'minecraft:stone' }, logger)).toBeFalsy()
   expect(predicate({ blockTag: 'minecraft:mineable/pickaxe' }, logger)).toBeFalsy()
   expect(predicate({ item: 'minecraft:stone' }, logger)).toBeFalsy()
   expect(predicate({ tag: 'minecraft:stone' }, logger)).toBeFalsy()
})
