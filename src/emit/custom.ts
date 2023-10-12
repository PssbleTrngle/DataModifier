import Rule from '../rule'
import { Acceptor } from '@pssbletrngle/pack-resolver'
import { Recipe } from '../parser/recipe'
import { toJson } from '../textHelper'
import { RecipeDefinition } from '../schema/recipe'
import { createId, Id, IdInput } from '../common/id'
import Registry from '../common/registry'
import { LootTable } from '../loader/loot'

export interface RegistryProvider<T> {
   forEach(consumer: (recipe: T, id: Id) => void): void
}

export default abstract class RuledEmitter<TEntry, TRule extends Rule<TEntry>> {

   protected constructor(private  readonly provider: RegistryProvider<TEntry>) {
   }


   private customEntries = new Registry<TEntry>()
   private rulesArray: TRule[] = []

   protected get rules(): ReadonlyArray<TRule> {
      return this.rulesArray
   }

   clear() {
      this.rulesArray = []
   }

   protected addRule(rule: TRule) {
      this.rulesArray.push(rule)
   }

   protected addCustom(
      id: IdInput,
      value: TEntry
   ) {
      this.customEntries.set(createId(id), value)
   }

   private async modify(acceptor: Acceptor) {
      this.provider.forEach((recipe, id) => {
         if (this.customRecipe.has(id)) return

         const path = this.recipePath(id)

         const rules = this.rules.filter(it => it.matches(id, recipe, this.logger))
         if (rules.length === 0) return

         const modified = rules.reduce<Recipe | null>((previous, rule) => previous && rule.modify(previous), recipe)

         acceptor(path, toJson(modified?.toDefinition() ?? RecipeEmitter.EMPTY_RECIPE))
      })
   }

   private async create(acceptor: Acceptor) {
      this.customRecipe.forEach((recipe, id) => {
         const path = this.recipePath(id)
         acceptor(path, toJson(recipe))
      })
   }

   async emit(acceptor: Acceptor) {
      await Promise.all([this.modifyRecipes(acceptor), this.createRecipes(acceptor)])
   }

}
