import { createResolver, Options } from '@pssbletrngle/pack-resolver'

export default function createTestResolver(options: Partial<Options> = {}) {
   return createResolver({ from: 'test/resources', silent: true, ...options })
}
