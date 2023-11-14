import RecipeParser, { Recipe, Replacer } from '../index.js'
import { Ingredient, IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/data/recipe.js'
import { ResultInput } from '../../../common/result.js'
import { WrappedIngredient } from './index.js'

export type SpaceStationRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: WrappedIngredient[]
      mana?: number
   }>

export class SpaceStationRecipe extends Recipe<SpaceStationRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients.map(it => it.ingredient)
   }

   getResults(): ResultInput[] {
      return []
   }

   replaceIngredient(replace: Replacer<Ingredient>): Recipe {
      return new SpaceStationRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(it => ({
            ...it,
            ingredient: replace(it.ingredient),
         })),
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
