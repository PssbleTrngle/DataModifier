import { TagRegistry } from '../loader/tags.js'
import { Logger } from '../logger.js'
import { encodeId, IdInput, NormalizedId, TagInput } from './id.js'
import { CommonTest, Predicate } from './ingredient.js'
import { InferIds, RegistryId } from '../schema/ids'

export function resolveCommonTest<TEntry, TId extends string>(
   test: CommonTest<TId>,
   resolve: (value: TEntry, logger?: Logger) => NormalizedId<TId>[],
   tags?: TagRegistry<RegistryId>
): Predicate<TEntry> {
   if (typeof test === 'function') {
      return (entry, logger) => resolve(entry, logger).some(id => test(id, logger))
   } else if (test instanceof RegExp) {
      return (ingredient, logger) => {
         return resolve(ingredient, logger).some(it => test.test(it))
      }
   } else if (test.startsWith('#')) {
      return (ingredient, logger) => {
         return resolve(ingredient, logger).some(id => {
            if (id.startsWith('#') && test === id) return true
            else if (tags) return tags.contains(test as TagInput, id) ?? false
            else throw new Error('Cannot parse ID test without tags')
         })
      }
   } else {
      return (ingredient, logger) => {
         return resolve(ingredient, logger).includes(encodeId(test))
      }
   }
}

export function resolveIDTest<T extends RegistryId>(
   test: CommonTest<NormalizedId<InferIds<T>>>,
   tags?: TagRegistry<T>
): Predicate<IdInput<InferIds<T>>> {
   return resolveCommonTest<IdInput<InferIds<T>>, NormalizedId<InferIds<T>>>(test, it => [encodeId(it)], tags)
}
