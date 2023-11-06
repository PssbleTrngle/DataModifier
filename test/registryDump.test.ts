import { createIngredient, createResult, PackLoader } from '../src/index.js'
import createTestLogger from './mock/TestLogger.js'
import { createResolver } from '@pssbletrngle/pack-resolver'
import { tryCatching } from '../src/error.js'

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
      expect(() => tryCatching(logger, () => createIngredient('example:unknown', loader.registries))).toThrow(
         "unknown minecraft:item 'example:unknown'"
      )

      expect(() => tryCatching(logger, () => createResult({ item: 'minecraft:kitkat' }, loader.registries))).toThrow(
         "unknown minecraft:item 'minecraft:kitkat'"
      )

      expect(() => tryCatching(logger, () => createIngredient({ block: 'something' }, loader.registries))).toThrow(
         "unknown minecraft:block 'minecraft:something'"
      )

      expect(() => tryCatching(logger, () => createResult({ fluid: 'whatever' }, loader.registries))).toThrow(
         "unknown minecraft:fluid 'minecraft:whatever'"
      )

      expect(() =>
         tryCatching(logger, () => createIngredient(['minecraft:stone', { fluid: 'no-idea' }], loader.registries))
      ).toThrow("unknown minecraft:fluid 'minecraft:no-idea'")
   })
})
