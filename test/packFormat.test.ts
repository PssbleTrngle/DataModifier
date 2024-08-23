import { EMPTY_LOOT_TABLE, EMPTY_RECIPE } from '../src/index.js'
import createTestAcceptor from './mock/TestAcceptor.js'
import setupLoader from './shared/loaderSetup.js'

const { loader } = setupLoader({ packFormat: 45 })

describe('loader respects different pack format versions', () => {
   it('folders follow new syntax after 1.21', async () => {
      const acceptor = createTestAcceptor()

      loader.recipes.add('example:test', EMPTY_RECIPE)
      loader.loot.add('example:test', EMPTY_LOOT_TABLE)

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('data/minecraft/loot_table/test.json')).toBe(EMPTY_LOOT_TABLE)
      expect(acceptor.jsonAt('data/minecraft/recipe/test.json')).toBe(EMPTY_RECIPE)
   })
})
