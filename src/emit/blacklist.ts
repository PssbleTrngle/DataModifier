import { InferIds, RegistryId } from '@pssbletrngle/data-modifier/generated'
import { Acceptor, arrayOrSelf } from '@pssbletrngle/pack-resolver'
import { uniq } from 'lodash-es'
import { encodeId, NormalizedId } from '../common/id.js'
import { createIngredient, IngredientTest, resolveIngredientTest } from '../common/ingredient.js'
import { IllegalShapeError } from '../error.js'
import RegistryLookup from '../loader/registry/index.js'
import { TagRegistryHolder } from '../loader/tags.js'
import { Logger } from '../logger.js'
import { toJson } from '../textHelper.js'
import { ClearableEmitter } from './index.js'

export type HideMode = 'jei' | 'polytone'
export interface BlacklistOptions {
   hideFrom?: HideMode | HideMode[]
}

export interface BlacklistRules {
   hide(...inputs: IngredientTest[]): void
   hideEntry<T extends RegistryId>(type: T, ...entries: RegistryIdInput<T>[]): void
}

type RegistryIdInput<T extends RegistryId> = InferIds<T> | RegExp

export default class BlacklistEmitter implements BlacklistRules, ClearableEmitter {
   private hidden: NormalizedId[] = []
   private hideModes: HideMode[]

   constructor(
      private readonly logger: Logger,
      private readonly tags: TagRegistryHolder,
      private readonly lookup: () => RegistryLookup,
      private options: BlacklistOptions
   ) {
      this.hideModes = arrayOrSelf(options.hideFrom)
   }

   hide(...inputs: IngredientTest[]) {
      this.hidden.push(...inputs.flatMap(test => this.resolveIds(test)).map(encodeId))
   }

   hideEntry<T extends RegistryId>(type: T, ...entries: RegistryIdInput<T>[]) {
      const lookup = this.lookup()
      const ids = entries
         .flatMap(entry => {
            if (typeof entry === 'string') {
               lookup.validateEntry(type, entry)
               return [entry]
            } else {
               const keys = lookup.keys(type)
               if (!keys) throw new Error(`cannot hide using regex/predicates, registry ${encodeId(type)} not loaded`)
               return [...keys].filter(it => entry.test(it))
            }
         })
         .map(encodeId)

      this.hidden.push(...ids)
   }

   private filterIds(test: IngredientTest) {
      const keys = this.lookup().keys('minecraft:item')
      if (!keys) throw new Error('you can only use regex/predicates to blacklist items if a registry dump is loaded')
      const predicate = resolveIngredientTest(test, this.tags, this.lookup())

      return [...keys.keys()].filter(it => predicate(it, this.logger))
   }

   private resolveIds(input: IngredientTest): string[] {
      if (input instanceof RegExp || typeof input === 'function') {
         return this.filterIds(input)
      }

      const ingredient = createIngredient(input, this.lookup())

      if (Array.isArray(ingredient)) {
         return ingredient.flatMap(it => this.resolveIds(it))
      }

      if ('item' in ingredient) return [ingredient.item]
      if ('fluid' in ingredient) return [ingredient.fluid]
      if ('block' in ingredient) return [ingredient.block]

      throw new IllegalShapeError('illegal blacklist entry', input)
   }

   async emit(acceptor: Acceptor) {
      const hiddenIds = uniq(this.hidden).sort()
      if (hiddenIds.length === 0) return

      const promises: Promise<void>[] = []
      if (this.hideModes.includes('jei')) promises.push(this.emitJei(acceptor, hiddenIds))
      if (this.hideModes.includes('polytone')) promises.push(this.emitPolytone(acceptor, hiddenIds))
      await Promise.all(promises)
   }

   private async emitJei(acceptor: Acceptor, hiddenIds: NormalizedId[]) {
      const content = hiddenIds.join('\n')
      const path = 'jei/blacklist.cfg'
      acceptor(path, content)
   }

   private async emitPolytone(acceptor: Acceptor, hiddenIds: NormalizedId[]) {
      const tabs = this.lookup().keys('minecraft:creative_mode_tab')

      if (!tabs) throw new Error('Cannot use polytone output without creative mod tab registry')

      const content = toJson({
         targets: [...tabs.values()],
         removals: [
            {
               type: 'items_match',
               items: hiddenIds,
            },
         ],
      })

      const path = 'assets/generated/polytone/creative_tab_modifiers/hidden.json'
      acceptor(path, content)
   }

   clear() {
      this.hidden = []
   }
}
