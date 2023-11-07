import createLogger from '../logger.js'
import RegistryDumpLoader from '../loader/registry/dump.js'
import { createResolver } from '@pssbletrngle/pack-resolver'
import { generateRegistryTypes } from './codegen/registry.js'

const logger = createLogger()

async function runCli() {
   const output = 'generated'

   const registry = new RegistryDumpLoader(logger)
   const resolver = createResolver({ from: 'test/resources/dump' })

   await registry.extract(resolver)

   generateRegistryTypes(registry, output)

   logger.info('successfully generated registry entry types')
}

runCli().catch(e => logger.error('an error occurred', e))
