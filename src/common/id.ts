export type Id = Readonly<{
   namespace: string
   path: string
   isTag?: boolean
}>

export type IdInput<T extends string> = T | Id

export type NormalizedId<T extends string> = `${string}:${string}` & T

export type TagInput = IdInput<`#${string}`>

export function createId(from: IdInput<string>): Id {
   if (typeof from !== 'string') return from
   if (from.startsWith('#')) return { ...createId(from.substring(1)), isTag: true }
   if (!from.includes(':')) return { namespace: 'minecraft', path: from }
   const [namespace, path] = from.split(':')
   return { namespace, path }
}

export function encodeId<T extends string>(from: IdInput<T>): NormalizedId<T> {
   if (typeof from === 'string') {
      if (from.includes(':')) return from as NormalizedId<T>
      if (from.startsWith('#')) return `#minecraft:${from.substring(1)}` as NormalizedId<T>
      return `minecraft:${from}` as NormalizedId<T>
   }
   if (from.isTag) return `#${from.namespace}:${from.path}` as NormalizedId<T>
   return `${from.namespace}:${from.path}` as NormalizedId<T>
}
