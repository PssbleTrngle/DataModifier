import RecipeParser, { Recipe, replace } from '..'
import { Ingredient, Predicate, Result } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import { ProcessingRecipe, ProcessingRecipeDefinition } from './processing'

export type AssemblyRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredient: Ingredient
      transitionalItem: Ingredient
      results: Result[]
      loops?: number
      sequence: ProcessingRecipeDefinition[]
   }>

class AssemblyRecipe extends Recipe<AssemblyRecipeDefinition> {
   private readonly sequence: ProcessingRecipe[]

   constructor(protected readonly definition: AssemblyRecipeDefinition) {
      super(definition)
      this.sequence = this.definition.sequence.map(it => new ProcessingRecipe(it))
   }

   getIngredients(): Ingredient[] {
      return [
         this.definition.ingredient,
         this.definition.transitionalItem,
         ...this.sequence.flatMap(it => it.getIngredients()),
      ]
   }

   getResults(): Result[] {
      return [...this.definition.results, ...this.sequence.flatMap(it => it.getResults())]
   }

   replaceIngredient(from: Predicate<Ingredient>, to: Ingredient): Recipe {
      return new AssemblyRecipe({
         ...this.definition,
         ingredient: replace(from, to)(this.definition.ingredient),
         transitionalItem: replace(from, to)(this.definition.ingredient),
         sequence: this.sequence.map(it => it.replaceIngredient(from, to).toDefinition()),
      })
   }

   replaceResult(from: Predicate<Ingredient>, to: Result): Recipe {
      return new AssemblyRecipe({
         ...this.definition,
         results: this.definition.results.map(replace(from, to)),
         sequence: this.sequence.map(it => it.replaceResult(from, to).toDefinition()),
      })
   }
}

export default class AssemblyRecipeParser extends RecipeParser<AssemblyRecipeDefinition, AssemblyRecipe> {
   create(definition: AssemblyRecipeDefinition): AssemblyRecipe {
      return new AssemblyRecipe(definition)
   }
}
