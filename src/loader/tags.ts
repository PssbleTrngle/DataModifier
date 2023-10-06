import { Acceptor } from '@pssbletrngle/pack-resolver'
import { orderBy, uniqBy } from 'lodash-es'
import { Logger } from '../logger'
import { TagDefinition, TagEntry } from '../schema/tag'
import { fromJson } from '../textHelper'

export function entryId(entry: TagEntry) {
   if (typeof entry === 'string') return entry
   else return entry.value
}

export function orderTagEntries(entries: TagEntry[]) {
   return orderBy(
      uniqBy(entries, it => entryId(it)),
      it => entryId(it)
   )
}

export interface TagRegistry {
   list(): string[]

   get(id: string): TagEntry[] | undefined

   resolve(id: string): TagEntry[]

   contains(id: string, entry: string): boolean
}

class WriteableTagRegistry implements TagRegistry {
   private readonly entries = new Map<string, TagEntry[]>()
   private frozen = false

   private parseId(id: string) {
      return id.startsWith('#') ? id.substring(1) : id
   }

   freeze() {
      this.frozen = true
   }

   load(id: string, definition: TagDefinition) {
      if (this.frozen) throw new Error('TagRegistry has already been frozen')

      const slicedId = this.parseId(id)
      const existingEntries = this.entries.get(slicedId) ?? []
      const unique = orderTagEntries([...existingEntries, ...definition.values])
      this.entries.set(slicedId, unique)
   }

   list() {
      if (!this.frozen) throw new Error('TagRegistry has not been frozen yet')
      return [...this.entries.keys()]
   }

   get(id: string) {
      if (!this.frozen) throw new Error('TagRegistry has not been frozen yet')
      const slicedId = this.parseId(id)
      return this.entries.get(slicedId)
   }

   resolve(id: string, level = 0): TagEntry[] {
      if (level >= 100) throw new Error(`Circular TagDefinition: ${id}`)

      const entries = this.get(id) ?? []
      return entries.flatMap(it => {
         const entry = entryId(it)
         const required = typeof it === 'string' ? true : it.required !== false

         if (entry.startsWith('#')) {
            if (entry === id) throw new Error(`Circular TagDefinition: ${entry} -> ${id}`)
            const step = this.resolve(entry)
            if (required) return step
            return step.map(it => {
               if (typeof it === 'string') return { required: false, value: it }
               return { ...it, required: false }
            })
         }
         return [it]
      })
   }

   contains(id: string, entry: string) {
      return (
         this.get(id)?.some(it => {
            if (typeof it === 'string') return it === entry
            return it.value === entry
         }) ?? false
      )
   }
}

export default class TagsLoader {
   private registries: Record<string, WriteableTagRegistry> = {}

   constructor(private readonly logger: Logger) {
      this.registerRegistry('items')
      this.registerRegistry('blocks')
      this.registerRegistry('fluids')
   }

   registerRegistry(key: string) {
      this.registries[key] = new WriteableTagRegistry()
   }

   registry(key: string): TagRegistry {
      if (!(key in this.registries))
         throw new Error(`unknown registry tags '${key}'. Register them using \`registerRegistry\``)
      return this.registries[key]
   }

   private parsePath(input: string) {
      const match = /data\/(?<namespace>[\w-]+)\/tags\/(?<rest>[\w-/]+).json/.exec(input)
      if (!match?.groups) return null

      const { namespace, rest } = match.groups

      const registry = Object.entries(this.registries).find(([it]) => rest.startsWith(`${it}/`))
      if (!registry) return null

      const path = rest.substring(registry[0].length + 1)

      return { namespace, registry: registry[1], path }
   }

   readonly accept: Acceptor = (path, content) => {
      const info = this.parsePath(path)
      if (!info) return false

      const parsed: TagDefinition = fromJson(content.toString())
      const id = `${info.namespace}:${info.path}`
      info.registry.load(id, parsed)

      return true
   }

   freeze() {
      Object.values(this.registries).forEach(it => it.freeze())
   }
}
