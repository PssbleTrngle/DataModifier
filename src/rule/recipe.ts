import { IngredientInput, Predicate } from '../../common/ingredient'
import { Recipe } from '../../parser/recipe'
import { encodeId, Id } from '../../common/id'
import { Logger } from '../../logger'

export type RecipeModifier = (recipe: Recipe) => Recipe | null

export default class RecipeRule {
   constructor(
      private readonly recipeTests: Predicate<Id>[],
      private readonly ingredientTests: Predicate<IngredientInput>[],
      private readonly resultTests: Predicate<IngredientInput>[],
      private readonly modifier: RecipeModifier
   ) {}

   matches(id: Id, recipe: Recipe, logger: Logger): boolean {
      const prefixed = logger.group(encodeId(id))
      return (
         this.recipeTests.every(test => test(id, prefixed)) &&
         this.ingredientTests.every(test => recipe.getIngredients().some(it => test(it, prefixed))) &&
         this.resultTests.every(test => recipe.getResults().some(it => test(it, prefixed)))
      )
   }

   modify(recipe: Recipe) {
      return this.modifier(recipe)
   }
}
