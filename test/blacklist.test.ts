import setupLoader from './shared/loaderSetup.js'
import createTestAcceptor from './mock/TestAcceptor.js'

const { loader } = setupLoader()

describe('blacklist tests', () => {
   it('generated a jei blacklist config file', async () => {
      const acceptor = createTestAcceptor()

      loader.blacklist.hide('minecraft:stone')
      loader.blacklist.hide({ fluid: 'water' })
      loader.blacklist.hide({ block: 'water' })
      loader.blacklist.hide(['ice', { fluid: 'forge:milk' }])

      await loader.emit(acceptor)

      expect(acceptor.at('jei/blacklist.cfg')).toMatchSnapshot('jei blacklist config file')
   })
   it('does not create the jei blacklist config if nothing is hidden', async () => {
      const acceptor = createTestAcceptor()

      await loader.emit(acceptor)

      expect(acceptor.at('jei/blacklist.cfg')).toBeNull()
   })
})
