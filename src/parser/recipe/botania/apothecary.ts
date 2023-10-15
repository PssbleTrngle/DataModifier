import RecipeParser, { Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
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

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new ApothecaryRecipe({
         ...this.definition,
         reagent: replace(this.definition.reagent),
         ingredients: this.definition.ingredients.map(replace),
      })
   }

   replaceResult(replace: Replacer<ResultInput>): Recipe {
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
