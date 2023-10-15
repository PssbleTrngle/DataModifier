import RecipeParser, { Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type HammeringRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: IngredientInput[]
      result: ResultInput
      mana?: number
   }>

export class HammeringRecipe extends Recipe<HammeringRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients
   }

   getResults(): ResultInput[] {
      return [this.definition.result]
   }

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new HammeringRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace),
      })
   }

   replaceResult(replace: Replacer<ResultInput>): Recipe {
      return new HammeringRecipe({
         ...this.definition,
         result: replace(this.definition.result),
      })
   }
}

export default class HammeringRecipeParser extends RecipeParser<HammeringRecipeDefinition, HammeringRecipe> {
   create(definition: HammeringRecipeDefinition): HammeringRecipe {
      return new HammeringRecipe(definition)
   }
}
