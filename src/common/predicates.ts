import { encodeId, IdInput, NormalizedId, TagInput } from './id'
import { TagRegistry } from '../loader/tags'
import { CommonTest, Predicate } from './ingredient'
import { Logger } from '../logger'

export function resolveCommonTest<TEntry, TId extends string>(
   test: CommonTest<NormalizedId<TId>>,
   resolve: (value: TEntry, logger?: Logger) => NormalizedId<TId>[],
   tags?: TagRegistry
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
         return resolve(ingredient, logger).includes(test)
      }
   }
}

export function resolveIDTest<T extends NormalizedId>(test: CommonTest<T>, tags?: TagRegistry): Predicate<IdInput<T>> {
   return resolveCommonTest(test, it => [encodeId<T>(it)], tags)
}
