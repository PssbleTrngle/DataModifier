import RecipeParser, { Recipe, replace } from '..'
import { Ingredient, Predicate, Result } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'

export type ApothecaryRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: Ingredient[]
      output: Result
      reagent: Ingredient
   }>

export class ApothecaryRecipe extends Recipe<ApothecaryRecipeDefinition> {
   getIngredients(): Ingredient[] {
      return [...this.definition.ingredients, this.definition.reagent]
   }

   getResults(): Result[] {
      return [this.definition.output]
   }

   replaceIngredient(from: Predicate<Ingredient>, to: Ingredient): ApothecaryRecipe {
      return new ApothecaryRecipe({
         ...this.definition,
         reagent: replace(from, to)(this.definition.reagent),
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(from: Predicate<Ingredient>, to: Result): ApothecaryRecipe {
      return new ApothecaryRecipe({
         ...this.definition,
         output: to,
      })
   }
}

export default class ApothecaryRecipeParser extends RecipeParser<ApothecaryRecipeDefinition, ApothecaryRecipe> {
   create(definition: ApothecaryRecipeDefinition): ApothecaryRecipe {
      return new ApothecaryRecipe(definition)
   }
}
