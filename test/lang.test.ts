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

   it('emits custom values', async () => {
      const acceptor = createTestAcceptor()

      loader.lang.addCustom('en_us', 'something.else', 'The Value')
      loader.lang.entryName('minecraft:item', 'minecraft:diamond', 'Sapphire')

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('assets/minecraft/lang/en_us.json')).toMatchSnapshot('custom values')
   })

   it('emits custom values together with replaced values', async () => {
      const acceptor = createTestAcceptor()

      loader.lang.addCustom('en_us', 'something.else', 'The Value')
      loader.lang.entryName('minecraft:item', 'minecraft:diamond', 'Sapphire')
      loader.lang.replaceValue('Diamond', 'ruby')

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('assets/minecraft/lang/en_us.json')).toMatchSnapshot('custom values')
   })
})
