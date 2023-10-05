import { Acceptor } from '@pssbletrngle/pack-resolver'
import { Logger } from '../logger'
import RecipeParser, { Recipe } from '../parser/recipe'
import ShapedParser from '../parser/recipe/vanilla/shaped'
import { RecipeDefinition } from '../schema/recipe'
import { TagRegistry } from './tags'
import RecipeRule from '../rule/recipe'
import { Id } from '../common/id'
import { Ingredient, IngredientTest, resolveIngredientTest, Result } from '../common/ingredient'
import ShapelessParser from '../parser/recipe/vanilla/shapeless'
import ProcessingRecipeParser from '../parser/recipe/create/processing'
import { fromJson, toJson } from '../textHelper'
import SmeltingParser from '../parser/recipe/vanilla/smelting'
import SmithingParser from '../parser/recipe/vanilla/smithing'
import AssemblyRecipeParser from '../parser/recipe/create/assembly'
import StonecuttingParser from '../parser/recipe/vanilla/stonecutting'

export default class RecipeLoader {
   private readonly recipeParsers = new Map<string, RecipeParser<RecipeDefinition, Recipe>>()
   private readonly rules: RecipeRule[] = []

   private readonly ignoredRecipeTypes = new Set<string>()
   private readonly unknownRecipeTypes = new Set<string>()

   private readonly recipes = new Map<Id, Recipe>()

   constructor(private readonly logger: Logger, private readonly itemTags: TagRegistry) {
      this.registerParser('minecraft:crafting_shaped', new ShapedParser())
      this.registerParser('minecraft:crafting_shapeless', new ShapelessParser())
      this.registerParser('minecraft:smelting', new SmeltingParser())
      this.registerParser('minecraft:smoking', new SmeltingParser())
      this.registerParser('minecraft:blasting', new SmeltingParser())
      this.registerParser('minecraft:campfire_cooking', new SmeltingParser())
      this.registerParser('minecraft:smithing', new SmithingParser())
      this.registerParser('minecraft:stonecutting', new StonecuttingParser())

      this.registerParser('create:mixing', new ProcessingRecipeParser())
      this.registerParser('create:pressing', new ProcessingRecipeParser())
      this.registerParser('create:emptying', new ProcessingRecipeParser())
      this.registerParser('create:crushing', new ProcessingRecipeParser())
      this.registerParser('create:milling', new ProcessingRecipeParser())
      this.registerParser('create:compacting', new ProcessingRecipeParser())
      this.registerParser('create:filling', new ProcessingRecipeParser())
      this.registerParser('create:cutting', new ProcessingRecipeParser())
      this.registerParser('create:item_application', new ProcessingRecipeParser())
      this.registerParser('create:sandpaper_polishing', new ProcessingRecipeParser())
      this.registerParser('create:deploying', new ProcessingRecipeParser())
      this.registerParser('create:splashing', new ProcessingRecipeParser())
      this.registerParser('create:haunting', new ProcessingRecipeParser())
      this.registerParser('create:mechanical_crafting', new ShapedParser())
      this.registerParser('create:sequenced_assembly', new AssemblyRecipeParser())
   }

   registerParser(recipeType: string, parser: RecipeParser<RecipeDefinition, Recipe>) {
      this.recipeParsers.set(recipeType, parser)
   }

   addRule(rule: RecipeRule) {
      this.rules.push(rule)
   }

   accept: Acceptor = (path, content) => {
      const match = path.match(/data\/(?<namespace>[\w-]+)\/recipes\/(?<rest>[\w-/]+).json/)
      if (!match?.groups) return false

      const { namespace, rest } = match.groups
      const id: Id = { namespace, path: rest }

      const parsed: RecipeDefinition = fromJson(content.toString())

      if (!('type' in parsed)) return false
      if (Object.keys(parsed).length <= 1) return false
      if (this.ignoredRecipeTypes.has(parsed.type)) return false

      const parser = this.recipeParsers.get(parsed.type)

      if (!parser) {
         if (!this.unknownRecipeTypes.has(parsed.type)) {
            this.logger.warn(`unknown recipe type: '${parsed.type}'`)
            this.unknownRecipeTypes.add(parsed.type)
         }
         return false
      }

      const recipe = parser.create(parsed)
      this.recipes.set(id, recipe)

      return true
   }

   emit(acceptor: Acceptor) {
      this.recipes.forEach((recipe, id) => {
         const path = `data/${id.namespace}/recipe/${id.path}.json`

         const rules = this.rules.filter(it => it.matches(recipe))
         if (rules.length === 0) return

         const modified = rules.reduce((previous, rule) => rule.modify(previous), recipe)

         acceptor(path, toJson(modified.toDefinition()))
      })
   }

   replaceResult(test: IngredientTest, value: Result) {
      const predicate = resolveIngredientTest(test, this.itemTags)
      this.addRule(new RecipeRule([], [predicate], recipe => recipe.replaceResult(predicate, value)))
   }

   replaceIngredient(test: IngredientTest, value: Ingredient) {
      const predicate = resolveIngredientTest(test, this.itemTags)
      this.addRule(new RecipeRule([predicate], [], recipe => recipe.replaceIngredient(predicate, value)))
   }
}
