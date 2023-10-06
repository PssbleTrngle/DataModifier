import RecipeParser, { Recipe, replace } from '..'
import { Ingredient, Predicate, Result } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import { BlockInput, createBlockInput, fromBlockInput } from './block'

export type ManaInfusionRecipeDefinition = RecipeDefinition &
   Readonly<{
      input: Ingredient
      output: Result
      catalyst?: BlockInput
      mana?: number
   }>

export class ManaInfusionRecipe extends Recipe<ManaInfusionRecipeDefinition> {
   getIngredients(): Ingredient[] {
      if (!this.definition.catalyst) return [this.definition.input]
      return [fromBlockInput(this.definition.catalyst), this.definition.input]
   }

   getResults(): Result[] {
      return [this.definition.output]
   }

   replaceIngredient(from: Predicate<Ingredient>, to: Ingredient): ManaInfusionRecipe {
      return new ManaInfusionRecipe({
         ...this.definition,
         input: replace(from, to)(this.definition.input),
         catalyst:
            (this.definition.catalyst &&
               createBlockInput(replace(from, to)(fromBlockInput(this.definition.catalyst)))) ??
            this.definition.catalyst,
      })
   }

   replaceResult(from: Predicate<Ingredient>, to: Result): ManaInfusionRecipe {
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
