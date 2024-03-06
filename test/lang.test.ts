import createTestAcceptor from './mock/TestAcceptor.js'
import setupLoader from './shared/loaderSetup.js'

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

   it('only modifies values of given mods', async () => {
      const acceptor = createTestAcceptor()

      loader.lang.replaceValue('Iron', 'Steel', { lang: 'en_us', mod: ['create', 'farmersdelight'] })

      await loader.emit(acceptor)

      expect(acceptor.paths()).toHaveLength(2)
   })

   it('respects keepCase option', async () => {
      const acceptor = createTestAcceptor()

      loader.lang.replaceValue('Dark Oak', 'Mahagony', { lang: 'en_us', mod: ['minecraft'], keepCase: false })

      await loader.emit(acceptor)

      expect(acceptor.jsonAt('assets/minecraft/lang/en_us.json')).toMatchSnapshot('kept case values')
   })
})
