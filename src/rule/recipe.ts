import { IngredientInput, Predicate } from '../common/ingredient'
import { Recipe } from '../parser/recipe'
import { encodeId, Id } from '../common/id'
import { Logger } from '../logger'
import Rule, { Modifier } from './index'

export default class RecipeRule extends Rule<Recipe> {
   constructor(
      private readonly idsTests: Predicate<Id>[],
      private readonly ingredientTests: Predicate<IngredientInput>[],
      private readonly resultTests: Predicate<IngredientInput>[],
      modifier: Modifier<Recipe>
   ) {
      super(modifier)
   }

   matches(id: Id, recipe: Recipe, logger: Logger): boolean {
      const prefixed = logger.group(encodeId(id))
      return (
         this.idsTests.every(test => test(id, prefixed)) &&
         this.ingredientTests.every(test => recipe.getIngredients().some(it => test(it, prefixed))) &&
         this.resultTests.every(test => recipe.getResults().some(it => test(it, prefixed)))
      )
   }
}
