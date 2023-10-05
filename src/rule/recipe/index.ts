import { Ingredient, Predicate } from '../../common/ingredient'
import { Recipe } from '../../parser/recipe'

export type RecipeModifier = (recipe: Recipe) => Recipe

export default class RecipeRule {
   constructor(
      private readonly ingredientTests: Predicate<Ingredient>[],
      private readonly resultTests: Predicate<Ingredient>[],
      private readonly modifier: RecipeModifier
   ) {}

   matches(recipe: Recipe): boolean {
      return (
         this.ingredientTests.every(test => recipe.getIngredients().some(it => test(it))) &&
         this.resultTests.every(test => recipe.getResults().some(it => test(it)))
      )
   }

   modify(recipe: Recipe) {
      return this.modifier(recipe)
   }
}
