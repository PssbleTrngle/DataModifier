import RecipeParser, { Recipe, Replacer } from '../index.js'
import { Ingredient, IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/data/recipe.js'
import { Result, ResultInput } from '../../../common/result.js'

export type ElvenTradeRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: Ingredient[]
      output: Result[]
      mana?: number
   }>

export class ElvenTradeRecipe extends Recipe<ElvenTradeRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients
   }

   getResults(): ResultInput[] {
      return this.definition.output
   }

   replaceIngredient(replace: Replacer<Ingredient>): Recipe {
      return new ElvenTradeRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace),
      })
   }

   replaceResult(replace: Replacer<Result>): Recipe {
      return new ElvenTradeRecipe({
         ...this.definition,
         output: this.definition.output.map(replace),
      })
   }
}

export default class ElvenTradeRecipeParser extends RecipeParser<ElvenTradeRecipeDefinition, ElvenTradeRecipe> {
   create(definition: ElvenTradeRecipeDefinition): ElvenTradeRecipe {
      return new ElvenTradeRecipe(definition)
   }
}
