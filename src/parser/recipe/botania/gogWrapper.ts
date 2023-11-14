import RecipeParser, { InlineRecipeParser, Recipe, Replacer } from '../index.js'
import { Ingredient, IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/data/recipe.js'
import { Result, ResultInput } from '../../../common/result.js'

export type GogWrapperRecipeDefinition = RecipeDefinition &
   Readonly<{
      nbt: string
      base: RecipeDefinition
      gog: RecipeDefinition
   }>

export class GogWrapperRecipe extends Recipe<GogWrapperRecipeDefinition> {
   constructor(
      definition: Omit<GogWrapperRecipeDefinition, 'base' | 'gog'>,
      private readonly base: Recipe,
      private readonly gog: Recipe
   ) {
      super({
         ...definition,
         base: base.toJSON(),
         gog: gog.toJSON(),
      })
   }

   getIngredients(): IngredientInput[] {
      return [...this.base.getIngredients(), ...this.gog.getIngredients()]
   }

   getResults(): ResultInput[] {
      return [...this.base.getResults(), ...this.gog.getResults()]
   }

   replaceIngredient(replace: Replacer<Ingredient>): Recipe {
      return new GogWrapperRecipe(
         this.definition,
         this.base.replaceIngredient(replace),
         this.gog.replaceIngredient(replace)
      )
   }

   replaceResult(replace: Replacer<Result>): Recipe {
      return new GogWrapperRecipe(this.definition, this.base.replaceResult(replace), this.gog.replaceResult(replace))
   }
}

export default class GogWrapperRecipeParser extends RecipeParser<GogWrapperRecipeDefinition, GogWrapperRecipe> {
   create(definition: GogWrapperRecipeDefinition, parser: InlineRecipeParser): GogWrapperRecipe {
      const base = parser(definition.base)
      const gog = parser(definition.gog)
      return new GogWrapperRecipe(definition, base, gog)
   }
}
