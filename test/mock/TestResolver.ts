import { createResolver, Options } from '@pssbletrngle/pack-resolver'

export default function createTestResolver(options: Partial<Options> = {}) {
   return createResolver({ from: 'example', silent: true, ...options })
}
