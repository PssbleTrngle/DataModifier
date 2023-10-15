import RecipeParser, { Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type SpaceStationRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: IngredientInput[]
      mana?: number
   }>

export class SpaceStationRecipe extends Recipe<SpaceStationRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients
   }

   getResults(): ResultInput[] {
      return []
   }

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new SpaceStationRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace),
      })
   }

   replaceResult(): Recipe {
      return new SpaceStationRecipe(this.definition)
   }
}

export default class SpaceStationRecipeParser extends RecipeParser<SpaceStationRecipeDefinition, SpaceStationRecipe> {
   create(definition: SpaceStationRecipeDefinition): SpaceStationRecipe {
      return new SpaceStationRecipe(definition)
   }
}
