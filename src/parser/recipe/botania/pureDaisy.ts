import RecipeParser, { Recipe } from '..'
import { IngredientInput, Predicate } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import {
   BlockInput,
   BlockOutput,
   createBlockInput,
   createBlockOutput,
   fromBlockInput,
   fromBlockOutput,
} from './orechid'
import { ResultInput } from '../../../common/result'

export type PureDaisyRecipeDefinition = RecipeDefinition &
   Readonly<{
      input: BlockInput
      output: BlockOutput
      result: ResultInput
   }>

export class PureDaisyRecipe extends Recipe<PureDaisyRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return [fromBlockInput(this.definition.input)]
   }

   getResults(): ResultInput[] {
      return [fromBlockOutput(this.definition.output)]
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new PureDaisyRecipe({
         ...this.definition,
         input: createBlockInput(to) ?? this.definition.input,
      })
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe {
      return new PureDaisyRecipe({
         ...this.definition,
         output: createBlockOutput(to) ?? this.definition.output,
      })
   }
}

export default class PureDaisyRecipeParser extends RecipeParser<PureDaisyRecipeDefinition, PureDaisyRecipe> {
   create(definition: PureDaisyRecipeDefinition): PureDaisyRecipe {
      return new PureDaisyRecipe(definition)
   }
}
