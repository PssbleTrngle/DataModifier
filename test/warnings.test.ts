import setupLoader from './shared/loaderSetup.js'
import createTestAcceptor from './mock/TestAcceptor.js'

const { logger, loader } = setupLoader({ include: ['data/*/recipes/**/*.json'], from: 'test/resources/failing' })

describe('tests regarding error logging', () => {
   it('warns about incorrect result shape only once', async () => {
      const acceptor = createTestAcceptor()

      loader.recipes.replaceResult('minecraft:stone', { item: 'minecraft:deepslate' })
      loader.recipes.replaceResult('minecraft:stone', { item: 'minecraft:obsidian' })

      await loader.emit(acceptor)

      expect(logger.warn).toHaveBeenCalledWith(`data/example/recipes/incorrectResult.json -> unknown result shape`, 120)
   })
})
