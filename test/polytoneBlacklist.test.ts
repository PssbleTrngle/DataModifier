import { beforeEach, describe, expect, it } from 'vitest'
import createTestAcceptor from './mock/TestAcceptor.js'
import { createDumpResolver } from './mock/TestResolver.js'
import setupLoader from './shared/loaderSetup.js'

const { loader } = setupLoader({ load: false, hideFrom: ['polytone'] })

beforeEach(async () => {
   const resolver = createDumpResolver()
   await loader.loadRegistryDump(resolver)
})

describe('blacklist tests', () => {
   it('does not generate a jei blacklist config file', async () => {
      const acceptor = createTestAcceptor()

      loader.blacklist.hide('minecraft:stone')

      await loader.emit(acceptor)

      expect(acceptor.at('jei/blacklist.cfg')).toBeNull()
   })

   it('does not create the jei blacklist config if nothing is hidden', async () => {
      const acceptor = createTestAcceptor()

      loader.blacklist.hide('minecraft:stone')
      loader.blacklist.hide({ fluid: 'water' })
      loader.blacklist.hide({ block: 'water' })
      loader.blacklist.hide([{ item: 'ice' }, { fluid: 'minecraft:lava' }])

      await loader.emit(acceptor)

      expect(acceptor.at('assets/generated/polytone/creative_tab_modifiers/hidden.json')).toMatchSnapshot(
         'creates a polytone tab modifier'
      )
   })
})
