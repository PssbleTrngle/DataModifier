import createTestLogger from '../mock/TestLogger'
import { PackLoader } from '../../src'
import createTestResolver from '../mock/TestResolver'
import { Options } from '@pssbletrngle/pack-resolver'

export default function setupLoader(options?: Partial<Options>) {
   const logger = createTestLogger()
   const loader = new PackLoader(logger)

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
