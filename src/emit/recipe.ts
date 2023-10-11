import { RecipeRegistry } from '../loader/recipe'
import { Acceptor } from '@pssbletrngle/pack-resolver'
import { toJson } from '../textHelper'
import {
   CommonTest,
   Ingredient,
   IngredientInput,
   IngredientTest,
   Predicate,
   resolveIDTest,
   resolveIngredientTest,
   Result,
} from '../common/ingredient'
import RecipeRule from '../rule/recipe'
import { Logger } from '../logger'
import TagsLoader from '../loader/tags'
import { createId, Id, IdInput, NormalizedId } from '../common/id'
import { Recipe } from '../parser/recipe'
import { RecipeDefinition } from '../schema/recipe'
import Registry from '../common/registry'

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

export default class RecipeEmitter implements RecipeRules {
   // TODO conditions
   static readonly EMPTY_RECIPE: RecipeDefinition = {
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

   private rules: RecipeRule[] = []
   private customRecipe = new Registry<RecipeDefinition>()

   constructor(
      private readonly logger: Logger,
      private readonly registry: RecipeRegistry,
      private readonly tags: TagsLoader
   ) {}

   clear() {
      this.rules = []
   }

   private recipePath(id: Id) {
      return `data/${id.namespace}/recipe/${id.path}.json`
   }

   private async modifyRecipes(acceptor: Acceptor) {
      this.registry.forEach((recipe, id) => {
         if (this.customRecipe.has(id)) return

         const path = this.recipePath(id)

         const rules = this.rules.filter(it => it.matches(id, recipe))
         if (rules.length === 0) return

         const modified = rules.reduce<Recipe | null>((previous, rule) => previous && rule.modify(previous), recipe)

         acceptor(path, toJson(modified?.toDefinition() ?? RecipeEmitter.EMPTY_RECIPE))
      })
   }

   private async createRecipes(acceptor: Acceptor) {
      this.customRecipe.forEach((recipe, id) => {
         const path = this.recipePath(id)
         acceptor(path, toJson(recipe))
      })
   }

   async emit(acceptor: Acceptor) {
      await Promise.all([this.modifyRecipes(acceptor), this.createRecipes(acceptor)])
   }

   resolveIngredientTest(test: IngredientTest) {
      return resolveIngredientTest(test, this.tags, this.logger)
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

   addRule(rule: RecipeRule) {
      this.rules.push(rule)
   }

   addRecipe<TDefinition extends RecipeDefinition, TRecipe extends Recipe<TDefinition>>(
      id: IdInput,
      value: TDefinition | TRecipe
   ) {
      if (value instanceof Recipe) this.addRecipe(id, value.toDefinition())
      else this.customRecipe.set(createId(id), value)
   }

   removeRecipe(test: RecipeTest) {
      const recipePredicates = this.resolveRecipeTest(test)
      this.addRule(
         new RecipeRule(recipePredicates.recipe, recipePredicates.ingredient, recipePredicates.result, () => null)
      )
   }

   replaceResult(test: IngredientTest, value: Result, additionalTest: RecipeTest = {}) {
      const predicate = this.resolveIngredientTest(test)
      const recipePredicates = this.resolveRecipeTest(additionalTest)
      this.addRule(
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
      this.addRule(
         new RecipeRule(
            recipePredicates.recipe,
            [predicate, ...recipePredicates.ingredient],
            recipePredicates.result,
            recipe => recipe.replaceIngredient(predicate, value)
         )
      )
   }
}
