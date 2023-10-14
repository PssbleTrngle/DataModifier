import RecipeParser, { Recipe, replaceOrKeep } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { BlockInput, createBlockInput, fromBlockInput } from './orechid.js'
import { ResultInput } from '../../../common/result.js'

export type ManaInfusionRecipeDefinition = RecipeDefinition &
   Readonly<{
      input: IngredientInput
      output: ResultInput
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

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new ManaInfusionRecipe({
         ...this.definition,
         input: replaceOrKeep(from, to, this.definition.input),
         catalyst:
            (this.definition.catalyst &&
               createBlockInput(replaceOrKeep(from, to, fromBlockInput(this.definition.catalyst)))) ??
            this.definition.catalyst,
      })
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe {
      return new ManaInfusionRecipe({
         ...this.definition,
         output: to,
      })
   }
}

export default class ManaInfusionRecipeParser extends RecipeParser<ManaInfusionRecipeDefinition, ManaInfusionRecipe> {
   create(definition: ManaInfusionRecipeDefinition): ManaInfusionRecipe | null {
      return new ManaInfusionRecipe(definition)
   }
}
