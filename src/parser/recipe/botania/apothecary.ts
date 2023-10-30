import RecipeParser, { Recipe, Replacer } from '../index.js'
import { Ingredient, IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { Result, ResultInput } from '../../../common/result.js'

export type ApothecaryRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: Ingredient[]
      output: Result
      reagent: Ingredient
   }>

export class ApothecaryRecipe extends Recipe<ApothecaryRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return [...this.definition.ingredients, this.definition.reagent]
   }

   getResults(): ResultInput[] {
      return [this.definition.output]
   }

   replaceIngredient(replace: Replacer<Ingredient>): Recipe {
      return new ApothecaryRecipe({
         ...this.definition,
         reagent: replace(this.definition.reagent),
         ingredients: this.definition.ingredients.map(replace),
      })
   }

   replaceResult(replace: Replacer<Result>): Recipe {
      return new ApothecaryRecipe({
         ...this.definition,
         output: replace(this.definition.output),
      })
   }
}

export default class ApothecaryRecipeParser extends RecipeParser<ApothecaryRecipeDefinition, ApothecaryRecipe> {
   create(definition: ApothecaryRecipeDefinition): ApothecaryRecipe {
      return new ApothecaryRecipe(definition)
   }
}
