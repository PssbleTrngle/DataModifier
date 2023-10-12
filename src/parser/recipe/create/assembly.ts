import RecipeParser, { Recipe, replace, replaceOrKeep } from '..'
import { IngredientInput, Predicate } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import { ProcessingRecipe, ProcessingRecipeDefinition } from './processing'
import { ResultInput } from '../../../common/result'

export type AssemblyRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredient: IngredientInput
      transitionalItem: IngredientInput
      results: ResultInput[]
      loops?: number
      sequence: ProcessingRecipeDefinition[]
   }>

class AssemblyRecipe extends Recipe<AssemblyRecipeDefinition> {
   private readonly sequence: ProcessingRecipe[]

   constructor(protected readonly definition: AssemblyRecipeDefinition) {
      super(definition)
      this.sequence = this.definition.sequence.map(it => new ProcessingRecipe(it))
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

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new AssemblyRecipe({
         ...this.definition,
         ingredient: replaceOrKeep(from, to, this.definition.ingredient),
         transitionalItem: replaceOrKeep(from, to, this.definition.ingredient),
         sequence: this.sequence.map(it => it.replaceIngredient(from, to).toJSON()),
      })
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe {
      return new AssemblyRecipe({
         ...this.definition,
         results: this.definition.results.map(replace(from, to)),
         sequence: this.sequence.map(it => it.replaceResult(from, to).toJSON()),
      })
   }
}

export default class AssemblyRecipeParser extends RecipeParser<AssemblyRecipeDefinition, AssemblyRecipe> {
   create(definition: AssemblyRecipeDefinition): AssemblyRecipe {
      return new AssemblyRecipe(definition)
   }
}
