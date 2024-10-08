import { orderBy, uniqBy } from 'lodash-es'
import { encodeId, IdInput, NormalizedId, TagInput } from '../common/id.js'
import Registry from '../common/registry.js'
import { TagDefinition, TagEntry, tagFolderOf } from '../schema/data/tag.js'
import { fromJson } from '../textHelper.js'
import { AcceptorWithLoader } from './index.js'
import { InferIds, RegistryId } from '@pssbletrngle/data-modifier/generated'
import RegistryLookup from './registry/index.js'

export function entryId(entry: TagEntry) {
   if (typeof entry === 'string') return entry
   else return encodeId(entry.id)
}

export function orderTagEntries(entries: TagEntry[]) {
   return orderBy(
      uniqBy(entries, it => entryId(it)),
      it => entryId(it)
   )
}

export interface TagRegistryHolder {
   registry<T extends RegistryId>(key: T): TagRegistry<T>
}

export interface TagRegistry<T extends RegistryId> {
   list(): string[]

   get(id: TagInput): TagEntry<InferIds<T>>[] | undefined

   resolve(id: TagInput): TagEntry<InferIds<T>>[]

   contains(id: TagInput, entry: IdInput<InferIds<T>>): boolean
}

class WriteableTagRegistry<T extends RegistryId> implements TagRegistry<T> {
   private readonly entries = new Registry<TagEntry[]>()
   private frozen = false

   constructor(public readonly folder: string) {}

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
      const unique = orderTagEntries([...existingEntries, ...(definition.values ?? [])])
      // TODO support for advanced-tag-loader packs?

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
               if (typeof it === 'string') return { required: false, id: it }
               return { ...it, required: false }
            })
         }
         return [it]
      })
   }

   contains(id: TagInput, entry: IdInput<InferIds<RegistryId>>): boolean {
      const entryId = encodeId(entry)
      return (
         this.get(id)?.some(it => {
            const value = encodeId(typeof it === 'string' ? it : it.id)
            if (value === entryId) return true
            if (value.startsWith('#')) return this.contains(value as TagInput, entryId)
            return false
         }) ?? false
      )
   }
}

export default class TagsLoader implements TagRegistryHolder {
   // TODO lookup should add some?
   private registries: Record<NormalizedId, WriteableTagRegistry<RegistryId>> = {}

   constructor(private readonly lookup: () => RegistryLookup) {
      this.registerRegistry('minecraft:item', 'items')
      this.registerRegistry('minecraft:block', 'blocks')
      this.registerRegistry('minecraft:fluid', 'fluids')
      this.registerRegistry('minecraft:entity_type', 'entity_types')
   }

   registerRegistry(key: IdInput, folder = tagFolderOf(key)) {
      this.registries[encodeId(key)] = new WriteableTagRegistry(folder)
   }

   registry<T extends RegistryId>(key: IdInput<T>): TagRegistry<T> {
      const id = encodeId(key)
      if (!(id in this.registries))
         throw new Error(`unknown registry tags '${id}'. Register them using \`registerRegistry\``)
      return this.registries[id]
   }

   private parsePath(input: string) {
      const match = /data\/(?<namespace>[\w-]+)\/tags\/(?<rest>[\w-/]+).json/.exec(input)
      if (!match?.groups) return null

      const { namespace, rest } = match.groups

      const registry = Object.values(this.registries).find(it => rest.startsWith(`${it.folder}/`))
      if (!registry) return null

      const path = rest.substring(registry.folder.length + 1)

      return { namespace, registry, path, isTag: true }
   }

   readonly accept: AcceptorWithLoader = (_, path, content) => {
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
