import createTestAcceptor from './mock/TestAcceptor'
import setupLoader from './shared/loaderSetup'

const { loader } = setupLoader({ advancedTags: true })

describe('creation of tag definitions for the advanced tag-loader mod', () => {
   it('can generate files using remove entries', async () => {
      const acceptor = createTestAcceptor()

      loader.tags.blocks.add('#minecraft:fire_resistant_logs', '#minecraft:logs')
      loader.tags.blocks.remove('#minecraft:fire_resistant_logs', '#minecraft:logs_that_burn')

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('data/minecraft/tags/blocks/fire_resistant_logs.json')).toMatchSnapshot(
         'created #minecraft:fire_resistant_logs'
      )
   })

   it('fails when trying to remove using predicates', () => {
      const message = 'advanced tag loader only accepts tag entries in removal'

      expect(() => {
         loader.tags.blocks.remove('#minecraft:fire_resistant_logs', () => true)
      }).toThrow(message)

      expect(() => {
         loader.tags.blocks.remove('#minecraft:fire_resistant_logs', /regex/)
      }).toThrow(message)
   })
})
