import { RecipeRegistry } from '../loader/recipe'
import { Acceptor } from '@pssbletrngle/pack-resolver'
import { toJson } from '../textHelper'
import { Ingredient, IngredientTest, resolveIngredientTest, Result } from '../common/ingredient'
import RecipeRule from '../rule/recipe'
import { Logger } from '../logger'
import { TagRegistry } from '../loader/tags'

export interface RecipeRules {
   replaceResult(test: IngredientTest, value: Result): void
   replaceIngredient(test: IngredientTest, value: Ingredient): void
}

export default class RecipeEmitter implements RecipeRules {
   private rules: RecipeRule[] = []

   constructor(
      private readonly logger: Logger,
      private readonly registry: RecipeRegistry,
      private readonly itemTags: TagRegistry
   ) {}

   clear() {
      this.rules = []
   }

   async emit(acceptor: Acceptor) {
      this.registry.forEach((recipe, id) => {
         const path = `data/${id.namespace}/recipe/${id.path}.json`

         const rules = this.rules.filter(it => it.matches(recipe))
         if (rules.length === 0) return

         const modified = rules.reduce((previous, rule) => rule.modify(previous), recipe)

         acceptor(path, toJson(modified.toDefinition()))
      })
   }

   addRule(rule: RecipeRule) {
      this.rules.push(rule)
   }

   replaceResult(test: IngredientTest, value: Result) {
      const predicate = resolveIngredientTest(test, this.itemTags)
      this.addRule(new RecipeRule([], [predicate], recipe => recipe.replaceResult(predicate, value)))
   }

   replaceIngredient(test: IngredientTest, value: Ingredient) {
      const predicate = resolveIngredientTest(test, this.itemTags)
      this.addRule(new RecipeRule([predicate], [], recipe => recipe.replaceIngredient(predicate, value)))
   }
}
