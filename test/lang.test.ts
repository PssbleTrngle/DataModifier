import setupLoader from './shared/loaderSetup.js'
import createTestAcceptor from './mock/TestAcceptor.js'

const { loader } = setupLoader({ include: 'assets/*/lang/*.json' })

describe('replacing translation entries', () => {
   it('replaces using string value', async () => {
      const acceptor = createTestAcceptor()

      loader.lang.replaceValue('diorite', 'bird poop', { lang: 'en_us' })

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('assets/minecraft/lang/en_us.json')).toMatchSnapshot('replaced diorite values')
   })

   it('replaces requires the case to match', async () => {
      const acceptor = createTestAcceptor()

      loader.lang.replaceValue('Stone', 'rock', { lang: 'en_us', matchCase: true })

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('assets/minecraft/lang/en_us.json')).toMatchSnapshot('replaced matched case values')
   })
})
