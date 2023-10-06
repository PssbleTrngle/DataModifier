export type Id = Readonly<{
   namespace: string
   path: string
}>

export type IdInput = string | Id

export function createId(from: IdInput): Id {
   if (typeof from !== 'string') return from
   if (from.startsWith('#')) return createId(from.substring(1))
   if (!from.includes(':')) return { namespace: 'minecraft', path: from }
   const [namespace, path] = from.split(':')
   return { namespace, path }
}
