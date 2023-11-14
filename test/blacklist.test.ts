import setupLoader from './shared/loaderSetup.js'
import createTestAcceptor from './mock/TestAcceptor.js'
import { createDumpResolver } from './mock/TestResolver.js'
import { Ingredient } from '../src/index.js'

const { loader } = setupLoader({ load: false })

describe('blacklist tests', () => {
   it('generated a jei blacklist config file', async () => {
      const acceptor = createTestAcceptor()

      loader.blacklist.hide('minecraft:stone')
      loader.blacklist.hide({ fluid: 'water' })
      loader.blacklist.hide({ block: 'water' })
      loader.blacklist.hide([{ item: 'ice' }, { fluid: 'forge:milk' }])

      await loader.emit(acceptor)

      expect(acceptor.at('jei/blacklist.cfg')).toMatchSnapshot('jei blacklist config file')
   })

   it('does not create the jei blacklist config if nothing is hidden', async () => {
      const acceptor = createTestAcceptor()

      await loader.emit(acceptor)

      expect(acceptor.at('jei/blacklist.cfg')).toBeNull()
   })

   it('generated a blacklist using dumped ids', async () => {
      const acceptor = createTestAcceptor()

      await loader.loadRegistryDump(createDumpResolver())

      loader.blacklist.hide(/minecraft:.*oak.*/)
      loader.blacklist.hide((it: Ingredient) => 'item' in it && it.item.includes('granite'))

      await loader.emit(acceptor)

      expect(acceptor.at('jei/blacklist.cfg')).toMatchSnapshot('jei blacklist config file using registry dump')
   })

   it('fails when trying to use a regex/predicate without a registry dump', async () => {
      const acceptor = createTestAcceptor()

      const message = 'you can only use regex/predicates to blacklist items if a registry dump is loaded'
      expect(() => loader.blacklist.hide(/whatever/)).toThrow(message)
      expect(() => loader.blacklist.hide(() => true)).toThrow(message)

      await loader.emit(acceptor)

      expect(acceptor.at('jei/blacklist.cfg')).toBeNull()
   })

   it('validates custom registry ids', async () => {
      const acceptor = createTestAcceptor()

      await loader.loadRegistryDump(createDumpResolver())

      expect(() => loader.blacklist.hideEntry('example', /whatever/)).toThrow(
         `cannot hide using regex/predicates, registry minecraft:example not loaded`
      )
      loader.blacklist.hideEntry('minecraft:worldgen/biome', 'minecraft:basalt_deltas')
      loader.blacklist.hideEntry('minecraft:worldgen/biome', /minecraft:.+_forest/)

      await loader.emit(acceptor)

      expect(acceptor.at('jei/blacklist.cfg')).toMatchSnapshot('jei blacklist config file using biome registry')
   })
})
