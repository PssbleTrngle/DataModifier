import { IngredientInput, Predicate } from '../common/ingredient.js'
import { Recipe } from '../parser/recipe/index.js'
import { createId, encodeId, Id } from '../common/id.js'
import { Logger } from '../logger.js'
import Rule, { Modifier } from './index.js'

export default class RecipeRule extends Rule<Recipe> {
   constructor(
      private readonly idsTests: Predicate<Id>[],
      private readonly typeTests: Predicate<Id>[],
      private readonly ingredientTests: Predicate<IngredientInput>[],
      private readonly resultTests: Predicate<IngredientInput>[],
      modifier: Modifier<Recipe>
   ) {
      super(modifier)
   }

   matches(id: Id, recipe: Recipe, logger: Logger): boolean {
      const prefixed = logger.group(encodeId(id))
      const type = createId(recipe.toJSON().type)
      return (
         this.idsTests.every(test => test(id, prefixed)) &&
         this.typeTests.every(test => test(type, prefixed)) &&
         this.ingredientTests.every(test => recipe.getIngredients().some(it => test(it, prefixed))) &&
         this.resultTests.every(test => recipe.getResults().some(it => test(it, prefixed)))
      )
   }
}
