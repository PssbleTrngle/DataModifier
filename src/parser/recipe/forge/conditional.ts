import RecipeParser, { InlineRecipeParser, Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
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

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new ForgeConditionalRecipe(
         this.definition,
         this.recipes.map(it => ({ ...it, recipe: it.recipe.replaceIngredient(replace) }))
      )
   }

   replaceResult(replace: Replacer<ResultInput>): Recipe {
      return new ForgeConditionalRecipe(
         this.definition,
         this.recipes.map(it => ({ ...it, recipe: it.recipe.replaceResult(replace) }))
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
