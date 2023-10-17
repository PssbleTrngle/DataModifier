import { createResolver, IResolver, Options } from '@pssbletrngle/pack-resolver'

export default function createTestResolver(options: Partial<Options> = {}): IResolver {
   return createResolver({
      from: 'test/resources',
      silent: true,
      include: ['assets/**/*.json', 'data/**/*.json'],
      ...options,
   })
}
