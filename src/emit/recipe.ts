import {
   CommonTest,
   Ingredient,
   IngredientInput,
   IngredientTest,
   Predicate,
   resolveIngredientTest,
} from '../common/ingredient'
import RecipeRule from '../rule/recipe'
import { Logger } from '../logger'
import TagsLoader from '../loader/tags'
import { Id, IdInput, NormalizedId } from '../common/id'
import { Recipe } from '../parser/recipe'
import { RecipeDefinition } from '../schema/recipe'
import { resolveIDTest } from '../common/predicates'
import { Result } from '../common/result'
import RuledEmitter from './ruled'
import { RegistryProvider } from './index'
import CustomEmitter from './custom'
import { Acceptor } from '@pssbletrngle/pack-resolver'

type RecipeTest = Readonly<{
   id?: CommonTest<NormalizedId>
   namespace?: string
   output?: IngredientTest
   input?: IngredientTest
}>

export interface RecipeRules {
   replaceResult(test: IngredientTest, value: Result, additionalTests?: RecipeTest): void

   replaceIngredient(test: IngredientTest, value: Ingredient, additionalTests?: RecipeTest): void

   addRecipe<TDefinition extends RecipeDefinition, TRecipe extends Recipe<TDefinition>>(
      id: IdInput,
      value: TDefinition | TRecipe
   ): void

   removeRecipe(test: RecipeTest): void
}

export const EMPTY_RECIPE: RecipeDefinition = {
   type: 'noop',
   conditions: [
      {
         type: 'forge:false',
      },
   ],
   'fabric:load_conditions': [
      {
         condition: 'fabric:not',
         value: {
            condition: 'fabric:all_mods_loaded',
            values: ['minecraft'],
         },
      },
   ],
}

export default class RecipeEmitter implements RecipeRules {
   private readonly custom = new CustomEmitter<RecipeDefinition>(this.recipePath)

   private readonly ruled = new RuledEmitter<Recipe, RecipeRule>(
      this.logger,
      this.registry,
      this.recipePath,
      EMPTY_RECIPE,
      id => this.custom.has(id)
   )

   constructor(
      private readonly logger: Logger,
      private readonly registry: RegistryProvider<Recipe>,
      private readonly tags: TagsLoader
   ) {}

   private recipePath(id: Id) {
      return `data/${id.namespace}/recipe/${id.path}.json`
   }

   async emit(acceptor: Acceptor) {
      await Promise.all([this.ruled.emit(acceptor), this.custom.emit(acceptor)])
   }

   resolveIngredientTest(test: IngredientTest) {
      return resolveIngredientTest(test, this.tags)
   }

   private resolveRecipeTest(test: RecipeTest) {
      const recipe: Predicate<Id>[] = []
      const ingredient: Predicate<IngredientInput>[] = []
      const result: Predicate<IngredientInput>[] = []

      if (test.id) recipe.push(resolveIDTest(test.id))
      if (test.namespace) recipe.push(id => id.namespace === test.namespace)
      if (test.output) result.push(this.resolveIngredientTest(test.output))
      if (test.input) ingredient.push(this.resolveIngredientTest(test.input))

      return { recipe, ingredient, result }
   }

   addRecipe<TDefinition extends RecipeDefinition, TRecipe extends Recipe<TDefinition>>(
      id: IdInput,
      value: TDefinition | TRecipe
   ) {
      if (value instanceof Recipe) this.custom.add(id, value.toJSON())
      else this.custom.add(id, value)
   }

   removeRecipe(test: RecipeTest) {
      const recipePredicates = this.resolveRecipeTest(test)
      this.ruled.addRule(
         new RecipeRule(recipePredicates.recipe, recipePredicates.ingredient, recipePredicates.result, () => null)
      )
   }

   replaceResult(test: IngredientTest, value: Result, additionalTest: RecipeTest = {}) {
      const predicate = this.resolveIngredientTest(test)
      const recipePredicates = this.resolveRecipeTest(additionalTest)
      this.ruled.addRule(
         new RecipeRule(
            recipePredicates.recipe,
            recipePredicates.ingredient,
            [predicate, ...recipePredicates.result],
            recipe => recipe.replaceResult(predicate, value)
         )
      )
   }

   replaceIngredient(test: IngredientTest, value: Ingredient, additionalTest: RecipeTest = {}) {
      const predicate = this.resolveIngredientTest(test)
      const recipePredicates = this.resolveRecipeTest(additionalTest)
      this.ruled.addRule(
         new RecipeRule(
            recipePredicates.recipe,
            [predicate, ...recipePredicates.ingredient],
            recipePredicates.result,
            recipe => recipe.replaceIngredient(predicate, value)
         )
      )
   }

   clear() {
      this.custom.clear()
      this.ruled.clear()
   }
}
