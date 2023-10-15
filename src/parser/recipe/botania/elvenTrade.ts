import RecipeParser, { Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type ElvenTradeRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: IngredientInput[]
      output: ResultInput[]
      mana?: number
   }>

export class ElvenTradeRecipe extends Recipe<ElvenTradeRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients
   }

   getResults(): ResultInput[] {
      return this.definition.output
   }

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new ElvenTradeRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace),
      })
   }

   replaceResult(replace: Replacer<ResultInput>): Recipe {
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
