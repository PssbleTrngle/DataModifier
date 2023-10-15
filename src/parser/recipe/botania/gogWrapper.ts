import RecipeParser, { InlineRecipeParser, Recipe } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

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

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new GogWrapperRecipe(
         this.definition,
         this.base.replaceIngredient(from, to),
         this.gog.replaceIngredient(from, to)
      )
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe {
      return new GogWrapperRecipe(this.definition, this.base.replaceResult(from, to), this.gog.replaceResult(from, to))
   }
}

export default class GogWrapperRecipeParser extends RecipeParser<GogWrapperRecipeDefinition, GogWrapperRecipe> {
   create(definition: GogWrapperRecipeDefinition, parser: InlineRecipeParser): GogWrapperRecipe {
      const base = parser(definition.base)
      const gog = parser(definition.gog)
      return new GogWrapperRecipe(definition, base, gog)
   }
}
