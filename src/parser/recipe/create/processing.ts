import RecipeParser, { Recipe, replace } from '..'
import { IngredientInput, Predicate } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import { ResultInput } from '../../../common/result'

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

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): CreateProcessingRecipe {
      return new CreateProcessingRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): CreateProcessingRecipe {
      return new CreateProcessingRecipe({
         ...this.definition,
         results: this.definition.results.map(replace(from, to)),
      })
   }
}

export default class CreateProcessingRecipeParser extends RecipeParser<CreateProcessingRecipeDefinition, CreateProcessingRecipe> {
   create(definition: CreateProcessingRecipeDefinition): CreateProcessingRecipe {
      return new CreateProcessingRecipe(definition)
   }
}
