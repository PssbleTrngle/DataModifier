import RecipeParser, { InlineRecipeParser, Recipe } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type QuarkExclusionRecipeDefinition<T extends RecipeDefinition = RecipeDefinition> = T &
   Readonly<{
      true_type: string
      exclusions?: string[]
   }>

export class QuarkExclusionRecipe<
   TDefinition extends RecipeDefinition = RecipeDefinition,
   TRecipe extends Recipe<TDefinition> = Recipe<TDefinition>
> extends Recipe<QuarkExclusionRecipeDefinition<TDefinition>> {
   constructor(definition: QuarkExclusionRecipeDefinition<TDefinition>, private readonly trueRecipe: TRecipe) {
      super({
         ...definition,
         ...trueRecipe.toJSON(),
         true_type: trueRecipe.toJSON().type,
         type: definition.type,
      })
   }

   getIngredients(): IngredientInput[] {
      return this.trueRecipe.getIngredients()
   }

   getResults(): ResultInput[] {
      return this.trueRecipe.getResults()
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): QuarkExclusionRecipe {
      return new QuarkExclusionRecipe(this.definition, this.trueRecipe.replaceIngredient(from, to) as TRecipe)
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): QuarkExclusionRecipe {
      return new QuarkExclusionRecipe(this.definition, this.trueRecipe.replaceResult(from, to) as TRecipe)
   }
}

export default class QuarkExclusionRecipeParser extends RecipeParser<
   QuarkExclusionRecipeDefinition,
   QuarkExclusionRecipe
> {
   create(definition: QuarkExclusionRecipeDefinition, parser: InlineRecipeParser): QuarkExclusionRecipe {
      const trueRecipe = parser({ ...definition, type: definition.true_type })
      return new QuarkExclusionRecipe(definition, trueRecipe)
   }
}
