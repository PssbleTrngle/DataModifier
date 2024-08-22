import { Ingredient, IngredientInput } from '../../../common/ingredient.js'
import { Result, ResultInput } from '../../../common/result.js'
import { RecipeDefinition } from '../../../schema/data/recipe.js'
import RecipeParser, { Recipe, Replacer } from '../index.js'

export type GrindstonePolishingDefinition = RecipeDefinition &
   Readonly<{
      ingredients: Ingredient[]
      result: Result
      experience?: number
   }>

export class GrindstonePolishing extends Recipe<GrindstonePolishingDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients
   }

   getResults(): ResultInput[] {
      return [this.definition.result]
   }

   replaceIngredient(replace: Replacer<Ingredient>): Recipe {
      return new GrindstonePolishing({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace),
      })
   }

   replaceResult(replace: Replacer<Result>): Recipe {
      return new GrindstonePolishing({
         ...this.definition,
         result: replace(this.definition.result),
      })
   }
}

export default class GrindstonePolishingParser extends RecipeParser<
   GrindstonePolishingDefinition,
   GrindstonePolishing
> {
   create(definition: GrindstonePolishingDefinition): GrindstonePolishing {
      return new GrindstonePolishing(definition)
   }
}
