import { createIngredient, IngredientTest, resolveIngredientTest } from '../common/ingredient.js'
import { encodeId, NormalizedId } from '../common/id.js'
import { Acceptor } from '@pssbletrngle/pack-resolver'
import { uniq } from 'lodash-es'
import { IllegalShapeError } from '../error.js'
import { Logger } from '../logger.js'
import RegistryLookup from '../loader/registry/index.js'
import { TagRegistryHolder } from '../loader/tags.js'

export interface BlacklistRules {
   hide(...inputs: IngredientTest[]): void
}

export default class BlacklistEmitter implements BlacklistRules {
   private hidden: NormalizedId[] = []

   constructor(
      private readonly logger: Logger,
      private readonly tags: TagRegistryHolder,
      private readonly lookup: () => RegistryLookup
   ) {}

   hide(...inputs: IngredientTest[]) {
      this.hidden.push(...inputs.flatMap(test => this.resolveIds(test)).map(encodeId))
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

      throw new IllegalShapeError('illegal blacklist entry', test)
   }

   async emit(acceptor: Acceptor) {
      const hiddenIds = uniq(this.hidden).sort()
      if (hiddenIds.length === 0) return

      const content = hiddenIds.join('\n')
      const path = 'jei/blacklist.cfg'
      acceptor(path, content)
   }

   clear() {
      this.hidden = []
   }
}
