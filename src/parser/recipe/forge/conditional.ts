import RecipeParser, { InlineRecipeParser, Recipe } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

type WithConditions<T> = {
   conditions: unknown[]
   recipe: T
}

export type ForgeConditionalRecipeDefinition = RecipeDefinition &
   Readonly<{
      recipes: WithConditions<RecipeDefinition>[]
   }>

export class ForgeConditionalRecipe extends Recipe<ForgeConditionalRecipeDefinition> {
   constructor(
      definition: Omit<ForgeConditionalRecipeDefinition, 'recipes'>,
      private readonly recipes: WithConditions<Recipe>[]
   ) {
      super({
         ...definition,
         recipes: recipes.map(it => ({
            conditions: it.conditions,
            recipe: it.recipe.toJSON(),
         })),
      })
   }

   getIngredients(): IngredientInput[] {
      return this.recipes.flatMap(it => it.recipe.getIngredients())
   }

   getResults(): ResultInput[] {
      return this.recipes.flatMap(it => it.recipe.getResults())
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new ForgeConditionalRecipe(
         this.definition,
         this.recipes.map(it => ({ ...it, recipe: it.recipe.replaceIngredient(from, to) }))
      )
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): ForgeConditionalRecipe {
      return new ForgeConditionalRecipe(
         this.definition,
         this.recipes.map(it => ({ ...it, recipe: it.recipe.replaceResult(from, to) }))
      )
   }
}

export default class ForgeConditionalRecipeParser extends RecipeParser<
   ForgeConditionalRecipeDefinition,
   ForgeConditionalRecipe
> {
   create(definition: ForgeConditionalRecipeDefinition, parser: InlineRecipeParser): ForgeConditionalRecipe {
      const recipes = definition.recipes.map<WithConditions<Recipe>>(it => ({
         conditions: it.conditions,
         recipe: parser(it.recipe),
      }))

      return new ForgeConditionalRecipe(definition, recipes)
   }
}
