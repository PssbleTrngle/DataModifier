import { PackLoader } from '../src'
import { resolveIngredientTest } from '../src/common/ingredient'
import createTestLogger from './mock/TestLogger'
import createTestResolver from './mock/TestResolver'

const logger = createTestLogger()
const loader = new PackLoader(logger)
beforeAll(async () => {
   const resolver = createTestResolver({ include: ['data/*/tags/**/*.json'] })
   await loader.loadFrom(resolver)
}, 10_000)

test('matches ingredients using regex', () => {
   const predicate = resolveIngredientTest(/.+:spruce_.+/, loader.tagRegistry)

   expect(predicate({ item: 'minecraft:spruce_log' })).toBeTruthy()
   expect(predicate({ item: 'spruce_fence' })).toBeTruthy()
   expect(predicate({ item: 'a-mod:spruce_something' })).toBeTruthy()
   expect(predicate({ tag: 'minecraft:spruce_wood' })).toBeTruthy()

   expect(predicate({ item: 'minecraft:stripped_spruce_log' })).toBeFalsy()
   expect(predicate({ item: 'something:else' })).toBeFalsy()
   expect(predicate({ tag: 'minecraft:stripped_spruce_wood' })).toBeFalsy()
})

test('matches ingredients using item id', () => {
   const predicate = resolveIngredientTest('minecraft:obsidian', loader.tagRegistry)

   expect(predicate({ item: 'minecraft:obsidian' })).toBeTruthy()

   expect(predicate({ item: 'minecraft:obsidian_pillar' })).toBeFalsy()
   expect(predicate({ item: 'example:obsidian' })).toBeFalsy()
   expect(predicate({ item: 'minecraft:stone' })).toBeFalsy()
   expect(predicate({ tag: 'minecraft:obsidian' })).toBeFalsy()
   expect(predicate({ tag: 'minecraft:mineable/pickaxe' })).toBeFalsy()
})

test('matches ingredients using item tag', () => {
   const predicate = resolveIngredientTest('#minecraft:logs', loader.tagRegistry)

   expect(predicate({ item: 'minecraft:oak_log' })).toBeTruthy()
   expect(predicate({ item: 'stripped_birch_log' })).toBeTruthy()
   expect(predicate({ tag: 'minecraft:logs_that_burn' })).toBeTruthy()

   expect(predicate({ item: 'minecraft:stone' })).toBeFalsy()
   expect(predicate({ tag: 'minecraft:mineable/axe' })).toBeFalsy()
})

test('matches ingredients using item ingredient', () => {
   const predicate = resolveIngredientTest({ tag: 'minecraft:piglin_loved' }, loader.tagRegistry)

   expect(predicate({ item: 'minecraft:golden_sword' })).toBeTruthy()
   expect(predicate({ item: 'golden_apple' })).toBeTruthy()

   expect(predicate({ item: 'minecraft:ice' })).toBeFalsy()
   expect(predicate({ item: 'blackstone' })).toBeFalsy()
})

test('matches ingredients using tag ingredient', () => {
   const predicate = resolveIngredientTest({ item: 'minecraft:mangrove_leaves' }, loader.tagRegistry)

   expect(predicate({ item: 'minecraft:mangrove_leaves' })).toBeTruthy()
   expect(predicate({ item: 'mangrove_leaves' })).toBeTruthy()

   expect(predicate({ item: 'minecraft:mangrove_sapling' })).toBeFalsy()
})

test('matches ingredients using predicate', () => {
   const predicate = resolveIngredientTest(it => {
      if ('tag' in it) return it.tag.includes('stone')
      if ('item' in it) return it.item.includes('wool')
      return false
   }, loader.tagRegistry)

   expect(predicate({ item: 'minecraft:red_wool' })).toBeTruthy()
   expect(predicate({ item: 'green_wool' })).toBeTruthy()
   expect(predicate({ tag: 'example:stone_tools' })).toBeTruthy()

   expect(predicate({ item: 'minecraft:stone_pickaxe' })).toBeFalsy()
   expect(predicate({ item: 'stone_pickaxe' })).toBeFalsy()
   expect(predicate({ tag: 'minecraft:pink_wool' })).toBeFalsy()
})

test('matches fluid ingredients', () => {
   const predicate = resolveIngredientTest({ fluid: 'minecraft:water' }, loader.tagRegistry)

   expect(predicate({ fluid: 'minecraft:water' })).toBeTruthy()

   expect(predicate({ fluid: 'minecraft:lava' })).toBeFalsy()
   expect(predicate({ item: 'minecraft:water' })).toBeFalsy()
   expect(predicate({ fluidTag: 'minecraft:water' })).toBeFalsy()
   expect(predicate({ tag: 'minecraft:water' })).toBeFalsy()
})

test('matches fluid ingredients using tag', () => {
   const predicate = resolveIngredientTest({ fluidTag: 'minecraft:water' }, loader.tagRegistry)

   expect(predicate({ fluid: 'minecraft:water' })).toBeTruthy()
   expect(predicate({ fluid: 'minecraft:flowing_water' })).toBeTruthy()
   expect(predicate({ fluidTag: 'minecraft:water' })).toBeTruthy()

   expect(predicate({ fluid: 'minecraft:lava' })).toBeFalsy()
   expect(predicate({ fluidTag: 'minecraft:lava' })).toBeFalsy()
   expect(predicate({ item: 'minecraft:water' })).toBeFalsy()
   expect(predicate({ tag: 'minecraft:water' })).toBeFalsy()
})

test('matches block ingredients', () => {
   const predicate = resolveIngredientTest({ block: 'minecraft:water' }, loader.tagRegistry)

   expect(predicate({ block: 'minecraft:water' })).toBeTruthy()

   expect(predicate({ fluid: 'minecraft:lava' })).toBeFalsy()
   expect(predicate({ item: 'minecraft:water' })).toBeFalsy()
   expect(predicate({ fluidTag: 'minecraft:water' })).toBeFalsy()
   expect(predicate({ tag: 'minecraft:water' })).toBeFalsy()
})

test('matches block ingredients using tag', () => {
   const predicate = resolveIngredientTest({ blockTag: 'minecraft:base_stone_overworld' }, loader.tagRegistry)

   expect(predicate({ block: 'minecraft:stone' })).toBeTruthy()
   expect(predicate({ block: 'minecraft:andesite' })).toBeTruthy()
   expect(predicate({ blockTag: 'minecraft:base_stone_overworld' })).toBeTruthy()

   expect(predicate({ block: 'minecraft:obsidian' })).toBeFalsy()
   expect(predicate({ fluid: 'minecraft:stone' })).toBeFalsy()
   expect(predicate({ blockTag: 'minecraft:mineable/pickaxe' })).toBeFalsy()
   expect(predicate({ item: 'minecraft:stone' })).toBeFalsy()
   expect(predicate({ tag: 'minecraft:stone' })).toBeFalsy()
})
