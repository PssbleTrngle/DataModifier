import { Acceptor } from '@pssbletrngle/pack-resolver'
import { orderBy, uniqBy } from 'lodash-es'
import { IdInput, TagInput, encodeId } from '../common/id.js'
import Registry from '../common/registry.js'
import { Logger } from '../logger.js'
import { TagDefinition, TagEntry } from '../schema/tag.js'
import { fromJson } from '../textHelper.js'

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

export interface TagRegistryHolder {
   registry(key: string): TagRegistry
}

export interface TagRegistry {
   list(): string[]

   get(id: TagInput): TagEntry[] | undefined

   resolve(id: TagInput): TagEntry[]

   contains(id: TagInput, entry: IdInput): boolean
}

class WriteableTagRegistry implements TagRegistry {
   private readonly entries = new Registry<TagEntry[]>()
   private frozen = false

   private validateId(input: IdInput) {
      const id = encodeId(input)
      if (!id.startsWith('#')) throw new Error("tag id's must start with a '#'")
   }

   freeze() {
      this.frozen = true
   }

   load(id: TagInput, definition: TagDefinition) {
      this.validateId(id)
      if (this.frozen) throw new Error('TagRegistry has already been frozen')

      const existingEntries = this.entries.get(id) ?? []
      const unique = orderTagEntries([...existingEntries, ...definition.values])
      this.entries.set(id, unique)
   }

   list() {
      if (!this.frozen) throw new Error('TagRegistry has not been frozen yet')
      return this.entries.keys()
   }

   get(id: TagInput) {
      this.validateId(id)
      if (!this.frozen) throw new Error('TagRegistry has not been frozen yet')
      return this.entries.get(id)
   }

   resolve(input: TagInput, level = 0): TagEntry[] {
      const id = encodeId(input)
      if (level >= 100) throw new Error(`Circular TagDefinition: ${id}`)

      const entries = this.get(input) ?? []
      return entries.flatMap(it => {
         const entry = entryId(it)
         const required = typeof it === 'string' ? true : it.required !== false

         if (entry.startsWith('#')) {
            if (entry === id) throw new Error(`Circular TagDefinition: ${entry} -> ${id}`)
            const step = this.resolve(entry as TagInput)
            if (required) return step
            return step.map(it => {
               if (typeof it === 'string') return { required: false, value: it }
               return { ...it, required: false }
            })
         }
         return [it]
      })
   }

   contains(id: TagInput, entry: IdInput): boolean {
      const entryId = encodeId(entry)
      return (
         this.get(id)?.some(it => {
            const value = encodeId(typeof it === 'string' ? it : it.value)
            if (value === entryId) return true
            if (value.startsWith('#')) return this.contains(value as TagInput, entryId)
            return false
         }) ?? false
      )
   }
}

export default class TagsLoader implements TagRegistryHolder {
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

      return { namespace, registry: registry[1], path, isTag: true }
   }

   readonly accept: Acceptor = (path, content) => {
      const info = this.parsePath(path)
      if (!info) return false

      const parsed: TagDefinition = fromJson(content.toString())
      const id = encodeId(info) as TagInput
      info.registry.load(id, parsed)

      return true
   }

   freeze() {
      Object.values(this.registries).forEach(it => it.freeze())
   }
}
