import RecipeParser, { Recipe, replace, replaceOrKeep } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type ApothecaryRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: IngredientInput[]
      output: ResultInput
      reagent: IngredientInput
   }>

export class ApothecaryRecipe extends Recipe<ApothecaryRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return [...this.definition.ingredients, this.definition.reagent]
   }

   getResults(): ResultInput[] {
      return [this.definition.output]
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new ApothecaryRecipe({
         ...this.definition,
         reagent: replaceOrKeep(from, to, this.definition.reagent),
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe {
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
