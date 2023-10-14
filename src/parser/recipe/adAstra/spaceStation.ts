import RecipeParser, { Recipe, replace } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
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

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new SpaceStationRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(): Recipe {
      return new SpaceStationRecipe(this.definition)
   }
}

export default class SpaceStationRecipeParser extends RecipeParser<SpaceStationRecipeDefinition, SpaceStationRecipe> {
   create(definition: SpaceStationRecipeDefinition): SpaceStationRecipe | null {
      return new SpaceStationRecipe(definition)
   }
}
