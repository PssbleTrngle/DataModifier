import {
   CommonTest,
   createIngredient,
   Ingredient,
   IngredientInput,
   IngredientTest,
   Predicate,
   resolveIngredientTest,
} from '../common/ingredient.js'
import RecipeRule from '../rule/recipe.js'
import { Logger } from '../logger.js'
import TagsLoader from '../loader/tags.js'
import { encodeId, Id, IdInput, NormalizedId } from '../common/id.js'
import { createReplacer, Recipe, Replacer } from '../parser/recipe/index.js'
import { RecipeDefinition } from '../schema/recipe.js'
import { resolveIDTest } from '../common/predicates.js'
import { createResult, Result, ResultInput } from '../common/result.js'
import RuledEmitter from './ruled.js'
import { RegistryProvider } from './index.js'
import CustomEmitter from './custom.js'
import { Acceptor } from '@pssbletrngle/pack-resolver'

export type RecipeTest = Readonly<{
   id?: CommonTest<NormalizedId>
   type?: CommonTest<NormalizedId>
   namespace?: string
   output?: IngredientTest
   input?: IngredientTest
}>

export interface RecipeRules {
   replaceResult(test: IngredientTest, value: Result, additionalTests?: RecipeTest): void

   replaceIngredient(test: IngredientTest, value: Ingredient, additionalTests?: RecipeTest): void

   add<TDefinition extends RecipeDefinition, TRecipe extends Recipe<TDefinition>>(
      id: IdInput,
      value: TDefinition | TRecipe
   ): void

   remove(test: RecipeTest): void
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
      return `data/${id.namespace}/recipes/${id.path}.json`
   }

   async emit(acceptor: Acceptor) {
      await Promise.all([this.ruled.emit(acceptor), this.custom.emit(acceptor)])
   }

   resolveIngredientTest(test: IngredientTest) {
      return resolveIngredientTest(test, this.tags)
   }

   private resolveRecipeTest(test: RecipeTest) {
      const id: Predicate<Id>[] = []
      const type: Predicate<Id>[] = []
      const ingredient: Predicate<IngredientInput>[] = []
      const result: Predicate<IngredientInput>[] = []

      if (test.id) id.push(resolveIDTest(test.id))
      if (test.type) type.push(resolveIDTest(test.type))
      if (test.namespace) id.push(id => id.namespace === test.namespace)
      if (test.output) result.push(this.resolveIngredientTest(test.output))
      if (test.input) ingredient.push(this.resolveIngredientTest(test.input))

      return { id, type, ingredient, result }
   }

   add<TDefinition extends RecipeDefinition, TRecipe extends Recipe<TDefinition>>(
      id: IdInput,
      value: TDefinition | TRecipe
   ) {
      if (this.custom.has(id)) this.logger.error(`Overwriting custom recipe with ID ${encodeId(id)}`)
      if (value instanceof Recipe) this.custom.add(id, value.toJSON())
      else this.custom.add(id, value)
   }

   remove(test: RecipeTest) {
      const recipePredicates = this.resolveRecipeTest(test)
      this.ruled.addRule(
         new RecipeRule(
            [test],
            recipePredicates.id,
            recipePredicates.type,
            recipePredicates.ingredient,
            recipePredicates.result,
            () => null
         )
      )
   }

   replaceResult(test: IngredientTest, value: ResultInput, additionalTest?: RecipeTest) {
      const predicate = this.resolveIngredientTest(test)
      const recipePredicates = this.resolveRecipeTest(additionalTest ?? {})
      const replacer = createReplacer<ResultInput>(predicate, value)
      const replace: Replacer<Result> = it => createResult(replacer(it))

      this.ruled.addRule(
         new RecipeRule(
            ['replace result', test, 'with', value, additionalTest],
            recipePredicates.id,
            recipePredicates.type,
            recipePredicates.ingredient,
            [predicate, ...recipePredicates.result],
            recipe => recipe.replaceResult(replace)
         )
      )
   }

   replaceIngredient(test: IngredientTest, value: IngredientInput, additionalTest?: RecipeTest) {
      const predicate = this.resolveIngredientTest(test)
      const recipePredicates = this.resolveRecipeTest(additionalTest ?? {})
      const replacer = createReplacer<IngredientInput>(predicate, value)
      const replace: Replacer<Ingredient> = it => createIngredient(replacer(it))

      this.ruled.addRule(
         new RecipeRule(
            ['replace ingredient', test, 'with', value, additionalTest],
            recipePredicates.id,
            recipePredicates.type,
            [predicate, ...recipePredicates.ingredient],
            recipePredicates.result,
            recipe => recipe.replaceIngredient(replace)
         )
      )
   }

   clear() {
      this.custom.clear()
      this.ruled.clear()
   }
}
