import RecipeParser, { Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { CreateProcessingRecipe, CreateProcessingRecipeDefinition } from './processing.js'
import { ResultInput } from '../../../common/result.js'

export type AssemblyRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredient: IngredientInput
      transitionalItem: IngredientInput
      results: ResultInput[]
      loops?: number
      sequence: CreateProcessingRecipeDefinition[]
   }>

export class AssemblyRecipe extends Recipe<AssemblyRecipeDefinition> {
   private readonly sequence: CreateProcessingRecipe[]

   constructor(protected readonly definition: AssemblyRecipeDefinition) {
      super(definition)
      this.sequence = this.definition.sequence.map(it => new CreateProcessingRecipe(it))
   }

   getIngredients(): IngredientInput[] {
      return [
         this.definition.ingredient,
         this.definition.transitionalItem,
         ...this.sequence.flatMap(it => it.getIngredients()),
      ]
   }

   getResults(): ResultInput[] {
      return [...this.definition.results, ...this.sequence.flatMap(it => it.getResults())]
   }

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new AssemblyRecipe({
         ...this.definition,
         ingredient: replace(this.definition.ingredient),
         transitionalItem: replace(this.definition.ingredient),
         sequence: this.sequence.map(it => it.replaceIngredient(replace).toJSON()),
      })
   }

   replaceResult(replace: Replacer<ResultInput>): Recipe {
      return new AssemblyRecipe({
         ...this.definition,
         results: this.definition.results.map(replace),
         sequence: this.sequence.map(it => it.replaceResult(replace).toJSON()),
      })
   }
}

export default class AssemblyRecipeParser extends RecipeParser<AssemblyRecipeDefinition, AssemblyRecipe> {
   create(definition: AssemblyRecipeDefinition): AssemblyRecipe {
      return new AssemblyRecipe(definition)
   }
}
