export type Id = Readonly<{
   namespace: string
   path: string
   isTag?: boolean
}>

export type IdInput<T extends string = string> = T | Id

export function createId(from: IdInput): Id {
   if (typeof from !== 'string') return from
   if (from.startsWith('#')) return { ...createId(from.substring(1)), isTag: true }
   if (!from.includes(':')) return { namespace: 'minecraft', path: from }
   const [namespace, path] = from.split(':')
   return { namespace, path }
}

export function encodeId<T extends string>(from: IdInput<T>): T {
   if (typeof from === 'string') return from
   if (from.isTag) return `#${from.namespace}:${from.path}` as T
   return `${from.namespace}:${from.path}` as T
}
