import { createIngredient, IngredientInput } from '../common/ingredient.js'
import { encodeId } from '../common/id.js'
import { Acceptor } from '@pssbletrngle/pack-resolver'
import { uniq } from 'lodash-es'
import { IllegalShapeError } from '../error.js'

export interface BlacklistRules {
   hide(input: IngredientInput): void
}

export default class BlacklistEmitter implements BlacklistRules {
   private hidden: IngredientInput[] = []

   hide(input: IngredientInput) {
      this.hidden.push(input)
   }

   private resolveIds(input: IngredientInput): string[] {
      const ingredient = createIngredient(input)

      if (Array.isArray(ingredient)) {
         return ingredient.flatMap(it => this.resolveIds(it))
      }

      if ('item' in ingredient) return [ingredient.item]
      if ('fluid' in ingredient) return [ingredient.fluid]
      if ('block' in ingredient) return [ingredient.block]

      throw new IllegalShapeError('illegal blacklist entry', test)
   }

   async emit(acceptor: Acceptor) {
      const hiddenIds = uniq(this.hidden.flatMap(test => this.resolveIds(test)).map(encodeId))
      if (hiddenIds.length === 0) return

      const content = hiddenIds.join('\n')
      const path = 'jei/blacklist.cfg'
      acceptor(path, content)
   }

   clear() {
      this.hidden = []
   }
}
