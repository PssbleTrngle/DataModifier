import createTestLogger from '../mock/TestLogger.js'
import { PackLoader } from '../../src/index.js'
import createTestResolver from '../mock/TestResolver.js'
import { Options } from '@pssbletrngle/pack-resolver'

export default function setupLoader(options?: Partial<Options>, block?: (loader: PackLoader) => void) {
   const logger = createTestLogger()
   const loader = new PackLoader(logger)

   block?.(loader)

   beforeAll(async () => {
      const resolver = createTestResolver(options)
      await loader.loadFrom(resolver)
   }, 15_0000)

   afterEach(() => {
      loader.clear()
      logger.reset()
   })

   return { loader, logger }
}
