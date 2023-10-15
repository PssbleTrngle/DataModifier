import RecipeParser, { Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type CreateProcessingRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: IngredientInput[]
      results: ResultInput[]
      heatRequirement?: string
   }>

export class CreateProcessingRecipe extends Recipe<CreateProcessingRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients
   }

   getResults(): ResultInput[] {
      return this.definition.results
   }

   replaceIngredient(replace: Replacer<IngredientInput>): CreateProcessingRecipe {
      return new CreateProcessingRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace),
      })
   }

   replaceResult(replace: Replacer<ResultInput>): CreateProcessingRecipe {
      return new CreateProcessingRecipe({
         ...this.definition,
         results: this.definition.results.map(replace),
      })
   }
}

export default class CreateProcessingRecipeParser extends RecipeParser<
   CreateProcessingRecipeDefinition,
   CreateProcessingRecipe
> {
   create(definition: CreateProcessingRecipeDefinition): CreateProcessingRecipe {
      return new CreateProcessingRecipe(definition)
   }
}
