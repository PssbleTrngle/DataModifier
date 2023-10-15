import RecipeParser, { Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type ThermalFuelRecipeDefinition = RecipeDefinition &
   Readonly<{
      energy: number
      ingredient: IngredientInput
   }>

export class ThermalFuelRecipe extends Recipe<ThermalFuelRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return [this.definition.ingredient]
   }

   getResults(): ResultInput[] {
      return []
   }

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new ThermalFuelRecipe({
         ...this.definition,
         ingredient: replace(this.definition.ingredient),
      })
   }

   replaceResult(): ThermalFuelRecipe {
      return new ThermalFuelRecipe(this.definition)
   }
}

export default class ThermalFuelRecipeParser extends RecipeParser<ThermalFuelRecipeDefinition, ThermalFuelRecipe> {
   create(definition: ThermalFuelRecipeDefinition): ThermalFuelRecipe {
      return new ThermalFuelRecipe(definition)
   }
}
