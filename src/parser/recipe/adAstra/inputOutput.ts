import RecipeParser, { Recipe, replaceOrKeep } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type InputOutputRecipeDefinition = RecipeDefinition &
   Readonly<{
      input: IngredientInput
      output: ResultInput
      mana?: number
   }>

export class InputOutputRecipe extends Recipe<InputOutputRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return [this.definition.input]
   }

   getResults(): ResultInput[] {
      return [this.definition.output]
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new InputOutputRecipe({
         ...this.definition,
         input: replaceOrKeep(from, to, this.definition.input),
      })
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe {
      return new InputOutputRecipe({
         ...this.definition,
         output: replaceOrKeep(from, to, this.definition.output),
      })
   }
}

export default class InputOutputRecipeParser extends RecipeParser<InputOutputRecipeDefinition, InputOutputRecipe> {
   create(definition: InputOutputRecipeDefinition): InputOutputRecipe | null {
      return new InputOutputRecipe(definition)
   }
}
