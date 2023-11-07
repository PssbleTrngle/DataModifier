import { createResolver } from '@pssbletrngle/pack-resolver'
import { createIngredient, createResult, PackLoader } from '../src/index.js'
import createTestLogger from './mock/TestLogger.js'

const logger = createTestLogger()
const loader = new PackLoader(logger)

beforeEach(async () => {
   const resolver = createResolver({ from: 'test/resources/dump', silent: true })
   await loader.loadRegistryDump(resolver)
})

afterEach(() => {
   logger.reset()
   loader.clear()
})

describe('registry dump tests', () => {
   it('correctly loads imports registries', async () => {
      expect(logger.warn).not.toHaveBeenCalled()
      expect(loader.registries.keys('fluid')).toMatchSnapshot('dumped fluid registry entries')
   })

   it('warns about unknown registries', async () => {
      loader.registries.keys('example')

      expect(logger.warn).toHaveBeenCalledWith(
         "tried to access registry 'minecraft:example', which has not been loaded"
      )
   })

   it('validates correct ingredients', async () => {
      createIngredient('minecraft:stone', loader.registries)
      createResult({ item: 'minecraft:stick' }, loader.registries)
      createIngredient({ block: 'minecraft:obsidian' }, loader.registries)
      createResult({ fluid: 'minecraft:water' }, loader.registries)

      expect(logger.error).not.toHaveBeenCalled()
      expect(logger.warn).not.toHaveBeenCalled()
   })

   it('validates incorrect ingredients', async () => {
      expect(() => createIngredient('example:unknown', loader.registries)).toThrow(
         "unknown minecraft:item 'example:unknown'"
      )

      expect(() => createResult({ item: 'minecraft:kitkat' }, loader.registries)).toThrow(
         "unknown minecraft:item 'minecraft:kitkat'"
      )

      expect(() => createIngredient({ block: 'something' }, loader.registries)).toThrow(
         "unknown minecraft:block 'minecraft:something'"
      )

      expect(() => createResult({ fluid: 'whatever' }, loader.registries)).toThrow(
         "unknown minecraft:fluid 'minecraft:whatever'"
      )

      expect(() => createIngredient(['minecraft:stone', { fluid: 'no-idea' }], loader.registries)).toThrow(
         "unknown minecraft:fluid 'minecraft:no-idea'"
      )
   })

   it('recipe replacement validates incorrect ingredients', async () => {
      expect(() => {
         loader.recipes.replaceIngredient('minecraft:emerald', { item: 'minecraft:ruby' })
      }).toThrow("unknown minecraft:item 'minecraft:ruby'")

      expect(() => {
         loader.recipes.replaceIngredient('minecraft:ruby', { item: 'minecraft:lapis_lazuli' })
      }).toThrow("unknown minecraft:item 'minecraft:ruby'")

      expect(() => {
         loader.recipes.replaceResult(
            'minecraft:diamond_block',
            { item: 'minecraft:coal_block' },
            { input: 'minecraft:ruby' }
         )
      }).toThrow("unknown minecraft:item 'minecraft:ruby'")
   })

   it('loot replacement validates incorrect ingredients', async () => {
      expect(() => {
         loader.loot.replaceOutput('minecraft:emerald', { item: 'minecraft:ruby' })
      }).toThrow("unknown minecraft:item 'minecraft:ruby'")

      expect(() => {
         loader.loot.replaceOutput('minecraft:ruby', { item: 'minecraft:lapis_lazuli' })
      }).toThrow("unknown minecraft:item 'minecraft:ruby'")

      expect(() => {
         loader.loot.replaceOutput(
            'minecraft:diamond_block',
            { item: 'minecraft:coal_block' },
            { output: 'minecraft:ruby' }
         )
      }).toThrow("unknown minecraft:item 'minecraft:ruby'")

      expect(() => {
         loader.loot.removeOutput('minecraft:diamond_block', { output: 'minecraft:ruby' })
      }).toThrow("unknown minecraft:item 'minecraft:ruby'")

      expect(() => {
         loader.loot.disableLootTable({ output: 'minecraft:ruby_block' })
      }).toThrow("unknown minecraft:item 'minecraft:ruby_block'")
   })
})
