import { IngredientInput, Predicate } from '../../common/ingredient'
import { Recipe } from '../../parser/recipe'
import { encodeId, Id } from '../../common/id'

export type RecipeModifier = (recipe: Recipe) => Recipe | null

export default class RecipeRule {
   constructor(
      private readonly recipeTests: Predicate<Id>[],
      private readonly ingredientTests: Predicate<IngredientInput>[],
      private readonly resultTests: Predicate<IngredientInput>[],
      private readonly modifier: RecipeModifier
   ) {}

   matches(id: Id, recipe: Recipe): boolean {
      try {
         return (
            this.recipeTests.every(test => test(id)) &&
            this.ingredientTests.every(test => recipe.getIngredients().some(it => test(it))) &&
            this.resultTests.every(test => recipe.getResults().some(it => test(it)))
         )
      } catch (error) {
         console.error(error)
         throw new Error(`unable to test recipe ${encodeId(id)}`, { cause: error })
      }
   }

   modify(recipe: Recipe) {
      return this.modifier(recipe)
   }
}
