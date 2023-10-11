import { Acceptor } from '@pssbletrngle/pack-resolver'
import { toJson } from '../textHelper'
import { CommonTest } from '../common/ingredient'
import { Logger } from '../logger'
import TagsLoader, { entryId, orderTagEntries, TagRegistry } from '../loader/tags'
import { TagDefinition, TagEntry } from '../schema/tag'
import { createId, Id, NormalizedId, TagInput } from '../common/id'
import Registry from '../common/registry'
import { resolveIDTest } from '../common/predicates'

export interface TagRules {
   add(registry: string, id: `#${string}`, value: TagEntry): void

   remove<T extends string = string>(registry: string, id: `#${string}`, test: CommonTest<T>): void

   scoped(key: string): ScopedTagRules

   // todo ID type
   blocks: ScopedTagRules
   items: ScopedTagRules
   fluids: ScopedTagRules
}

interface ScopedTagRules<T extends string = string> {
   add(id: TagInput, value: TagEntry): void
   remove(id: TagInput, test: CommonTest<T>): void
}

type TagModifier = (previous: TagDefinition) => TagDefinition

class ScopedEmitter<T extends NormalizedId = NormalizedId> implements ScopedTagRules<T> {
   constructor(private readonly registry: TagRegistry) {}

   private readonly modifiers = new Registry<TagModifier[]>()

   getModified(consumer: (id: Id, definition: TagDefinition) => void) {
      this.modifiers.forEach((modifiers, id) => {
         const modified = modifiers.reduce((previous: TagDefinition, modifier) => modifier(previous), {
            values: [],
            replace: false,
         })

         consumer(createId(id), modified)
      })
   }

   private modify(id: TagInput, modifier: TagModifier) {
      this.modifiers.getOrPut(id, () => []).push(modifier)
   }

   add(id: TagInput, value: TagEntry) {
      this.modify(id, previous => {
         return {
            ...previous,
            values: [...previous.values, value],
         }
      })
   }

   remove(id: TagInput, test: CommonTest<T>) {
      const predicate = resolveIDTest(test, this.registry)
      this.modify(id, previous => {
         const defaultValues = (previous.replace ? undefined : this.registry.resolve(id)) ?? []
         return {
            replace: true,
            values: [...defaultValues, ...previous.values].filter(it => !predicate(entryId(it) as T)),
         }
      })
   }

   clear() {
      this.modifiers.clear()
   }
}

export default class TagEmitter implements TagRules {
   private readonly emitters = new Map<string, ScopedEmitter>()

   constructor(private readonly logger: Logger, private readonly registry: TagsLoader) {}

   clear() {
      this.emitters.forEach(it => it.clear())
   }

   async emit(acceptor: Acceptor) {
      this.emitters.forEach((scoped, registry) => {
         scoped.getModified((id, definition) => {
            const path = `data/${id.namespace}/tags/${registry}/${id.path}.json`

            acceptor(
               path,
               toJson({
                  ...definition,
                  values: orderTagEntries(definition.values),
               })
            )
         })
      })
   }

   add(registry: string, id: `#${string}`, value: TagEntry) {
      this.scoped(registry).add(id, value)
   }

   remove<T extends string = string>(registry: string, id: `#${string}`, test: CommonTest<T>): void {
      this.scoped<T>(registry).remove(id, test)
   }

   scoped<T extends string>(key: string): ScopedTagRules<T> {
      const existing = this.emitters.get(key)
      if (existing) return existing as ScopedTagRules<T>
      else {
         const emitter = new ScopedEmitter(this.registry.registry(key))
         this.emitters.set(key, emitter)
         return emitter as ScopedTagRules<T>
      }
   }

   blocks = this.scoped('blocks')
   items = this.scoped('items')
   fluids = this.scoped('fluids')
}
