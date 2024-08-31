import { describe, expect, it } from 'vitest'
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

      expect(acceptor.jsonAt('data/example/loot_table/test.json')).toMatchObject(EMPTY_LOOT_TABLE)
      expect(acceptor.jsonAt('data/example/recipe/test.json')).toMatchObject(EMPTY_RECIPE)

      expect(acceptor.jsonAt('data/example/loot_tables/test.json')).toBeNull()
      expect(acceptor.jsonAt('data/example/recipes/test.json')).toBeNull()
   })
})
