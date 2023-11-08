import { createMergedResolver, createResolver, IResolver, Options } from '@pssbletrngle/pack-resolver'

export default function createTestResolver(options: Partial<Options> = {}): IResolver {
   return createMergedResolver({
      from: 'test/resources/default',
      silent: true,
      include: ['assets/**/*.json', 'data/**/*.json'],
      ...options,
   })
}

export function createDumpResolver(): IResolver {
   return createResolver({ from: 'test/resources/dump', silent: true })
}
