import { createResolver } from '@pssbletrngle/pack-resolver'
import { existsSync } from 'fs'
import RegistryDumpLoader from '../loader/registry/dump.js'
import createLogger from '../logger.js'
import { generateRegistryTypes, generateStubTypes } from './codegen/registry.js'
import CliConfig, { fromArgs, printHelp } from './config.js'

const logger = createLogger()

runCli().catch(e => logger.error('an error occurred', e))

async function runCli() {
   const config = fromArgs(logger)

   switch (config.action) {
      case 'help':
         return printHelp(logger)
      case 'codegen':
         return runCodegen(config)
      default:
         throw new Error(`unknown action '${config.action}'`)
   }
}

async function runCodegen(config: CliConfig) {
   if (!config.output) throw new Error('output not specified')

   if (config.registryDump && existsSync(config.registryDump)) {
      const resolver = createResolver({ from: config.registryDump })

      const registry = new RegistryDumpLoader(logger)
      await registry.extract(resolver)

      generateRegistryTypes(registry, config.output)
      logger.info('successfully generated registry entry types')
   } else {
      logger.warn('registry dump missing, generating stub types')
      generateStubTypes(config.output)
   }
}
