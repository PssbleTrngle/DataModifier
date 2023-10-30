import RecipeParser, { Recipe, Replacer } from '../index.js'
import { Ingredient, IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { BlockInput, createBlockInput, fromBlockInput } from './orechid.js'
import { Result, ResultInput } from '../../../common/result.js'

export type ManaInfusionRecipeDefinition = RecipeDefinition &
   Readonly<{
      input: Ingredient
      output: Result
      catalyst?: BlockInput
      mana?: number
   }>

export class ManaInfusionRecipe extends Recipe<ManaInfusionRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      if (!this.definition.catalyst) return [this.definition.input]
      return [fromBlockInput(this.definition.catalyst), this.definition.input]
   }

   getResults(): ResultInput[] {
      return [this.definition.output]
   }

   replaceIngredient(replace: Replacer<Ingredient>): Recipe {
      return new ManaInfusionRecipe({
         ...this.definition,
         input: replace(this.definition.input),
         catalyst:
            (this.definition.catalyst && createBlockInput(replace(fromBlockInput(this.definition.catalyst)))) ??
            this.definition.catalyst,
      })
   }

   replaceResult(replace: Replacer<Result>): Recipe {
      return new ManaInfusionRecipe({
         ...this.definition,
         output: replace(this.definition.output),
      })
   }
}

export default class ManaInfusionRecipeParser extends RecipeParser<ManaInfusionRecipeDefinition, ManaInfusionRecipe> {
   create(definition: ManaInfusionRecipeDefinition): ManaInfusionRecipe {
      return new ManaInfusionRecipe(definition)
   }
}
