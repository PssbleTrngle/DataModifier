import { Acceptor } from '@pssbletrngle/pack-resolver'
import { uniqBy } from 'lodash-es'
import { Logger } from '../logger'
import { TagDefinition, TagEntry } from '../schema/tag'
import { fromJson } from '../textHelper'

function entryId(entry: TagEntry) {
   if (typeof entry === 'string') return entry
   else return entry.value
}

export class TagRegistry {
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
      const unique = uniqBy([...existingEntries, ...definition.values], it => entryId(it))
      this.entries.set(slicedId, unique)
   }

   list() {
      if (!this.frozen) throw new Error('TagRegistry has not been frozen yet')
      return [...this.entries?.keys()]
   }

   get(id: string) {
      if (!this.frozen) throw new Error('TagRegistry has not been frozen yet')
      const slicedId = this.parseId(id)
      return this.entries.get(slicedId)
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
   private registries: Record<string, TagRegistry> = {
      items: new TagRegistry(),
      blocks: new TagRegistry(),
   }

   constructor(private readonly logger: Logger) {}

   registry(key: string): TagRegistry {
      if (!(key in this.registries)) throw new Error(`unknown registry tags '${key}'`)
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
