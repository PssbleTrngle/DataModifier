import RecipeParser, { Recipe, replace } from '..'
import { IngredientInput, Predicate, ResultInput } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import { BlockInput, createBlockInput, fromBlockInput } from './orechid'

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
         input: replace(from, to)(this.definition.input),
         catalyst:
            (this.definition.catalyst &&
               createBlockInput(replace(from, to)(fromBlockInput(this.definition.catalyst)))) ??
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
   create(definition: ManaInfusionRecipeDefinition): ManaInfusionRecipe {
      return new ManaInfusionRecipe(definition)
   }
}
