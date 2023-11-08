import { Acceptor } from '@pssbletrngle/pack-resolver'
import { toJson } from '../textHelper.js'
import { CommonTest } from '../common/ingredient.js'
import { Logger } from '../logger.js'
import TagsLoader, { entryId, orderTagEntries, TagRegistry } from '../loader/tags.js'
import { TagDefinition, TagEntry, tagFolderOf } from '../schema/tag.js'
import { createId, encodeId, Id, NormalizedId, TagInput } from '../common/id.js'
import Registry from '../common/registry.js'
import { resolveIDTest } from '../common/predicates.js'
import { InferIds, RegistryId } from '@pssbletrngle/data-modifier/generated'

export interface TagRules {
   add<T extends RegistryId>(registry: T, id: TagInput, value: TagEntry<InferIds<T>>): void

   remove<T extends RegistryId>(registry: T, id: TagInput, test: CommonTest<NormalizedId<InferIds<T>>>): void

   scoped<T extends RegistryId>(key: T, folder?: string): ScopedTagRules<T>

   blocks: ScopedTagRules<'minecraft:block'>
   items: ScopedTagRules<'minecraft:item'>
   fluids: ScopedTagRules<'minecraft:fluid'>
}

interface ScopedTagRules<T extends RegistryId> {
   add(id: TagInput, value: TagEntry<InferIds<T>>): void
   remove(id: TagInput, test: CommonTest<NormalizedId<InferIds<T>>>): void
}

type TagModifier = (previous: TagDefinition) => TagDefinition

class ScopedEmitter<T extends RegistryId> implements ScopedTagRules<T> {
   constructor(private readonly registry: TagRegistry<RegistryId>, public readonly folder: string) {}

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

   remove(id: TagInput, test: CommonTest<NormalizedId<InferIds<T>>>) {
      const predicate = resolveIDTest(test, this.registry)
      this.modify(id, previous => {
         const defaultValues = (previous.replace ? undefined : this.registry.resolve(id)) ?? []
         return {
            replace: true,
            values: [...defaultValues, ...previous.values].filter(it => {
               return !predicate(encodeId(entryId(it)))
            }),
         }
      })
   }

   clear() {
      this.modifiers.clear()
   }
}

export default class TagEmitter implements TagRules {
   private readonly emitters = new Map<string, ScopedEmitter<RegistryId>>()

   constructor(private readonly logger: Logger, private readonly registry: TagsLoader) {}

   clear() {
      this.emitters.forEach(it => it.clear())
   }

   async emit(acceptor: Acceptor) {
      this.emitters.forEach(scoped => {
         scoped.getModified((id, definition) => {
            const path = `data/${id.namespace}/tags/${scoped.folder}/${id.path}.json`

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

   add<T extends RegistryId>(registry: T, id: TagInput, value: TagEntry<InferIds<T>>) {
      this.scoped(registry).add(id, value)
   }

   remove<T extends RegistryId>(registry: T, id: TagInput, test: CommonTest<NormalizedId<InferIds<T>>>) {
      this.scoped<T>(registry).remove(id, test)
   }

   scoped<T extends RegistryId>(registry: T, folder: string = tagFolderOf(registry)): ScopedTagRules<T> {
      const existing = this.emitters.get(registry)
      if (existing) return existing as ScopedTagRules<T>
      else {
         const emitter = new ScopedEmitter(this.registry.registry(registry), folder)
         this.emitters.set(registry, emitter)
         return emitter as ScopedTagRules<T>
      }
   }

   blocks = this.scoped('minecraft:block', 'blocks')
   items = this.scoped('minecraft:item', 'items')
   fluids = this.scoped('minecraft:fluid', 'fluids')
}
