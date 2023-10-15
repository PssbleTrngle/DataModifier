import RecipeParser, { Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
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

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new InputOutputRecipe({
         ...this.definition,
         input: replace(this.definition.input),
      })
   }

   replaceResult(replace: Replacer<ResultInput>): Recipe {
      return new InputOutputRecipe({
         ...this.definition,
         output: replace(this.definition.output),
      })
   }
}

export default class InputOutputRecipeParser extends RecipeParser<InputOutputRecipeDefinition, InputOutputRecipe> {
   create(definition: InputOutputRecipeDefinition): InputOutputRecipe {
      return new InputOutputRecipe(definition)
   }
}
