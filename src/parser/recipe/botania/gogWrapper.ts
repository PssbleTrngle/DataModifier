import RecipeParser, { Recipe } from '..'
import { IngredientInput, Predicate } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import RecipeLoader from '../../../loader/recipe'
import { ResultInput } from '../../../common/result'

export type GogWrapperRecipeDefinition = RecipeDefinition &
   Readonly<{
      nbt: string
      base: RecipeDefinition
      gog: RecipeDefinition
   }>

export class GogWrapperRecipe extends Recipe<Omit<GogWrapperRecipeDefinition, 'recipe'>> {
   constructor(
      definition: Omit<GogWrapperRecipeDefinition, 'recipe'>,
      private readonly base: Recipe,
      private readonly gog: Recipe
   ) {
      super(definition)
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
   constructor(private readonly loader: RecipeLoader) {
      super()
   }

   create(definition: GogWrapperRecipeDefinition): GogWrapperRecipe | null {
      const base = this.loader.parse(definition.base)
      const gog = this.loader.parse(definition.gog)
      if (!base || !gog) return null
      return new GogWrapperRecipe(definition, base, gog)
   }
}
