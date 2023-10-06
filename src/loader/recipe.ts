import { Acceptor } from '@pssbletrngle/pack-resolver'
import { Logger } from '../logger'
import RecipeParser, { Recipe } from '../parser/recipe'
import ShapedParser from '../parser/recipe/vanilla/shaped'
import { RecipeDefinition } from '../schema/recipe'
import { Id } from '../common/id'
import ShapelessParser from '../parser/recipe/vanilla/shapeless'
import ProcessingRecipeParser from '../parser/recipe/create/processing'
import { fromJson } from '../textHelper'
import SmeltingParser from '../parser/recipe/vanilla/smelting'
import SmithingParser from '../parser/recipe/vanilla/smithing'
import AssemblyRecipeParser from '../parser/recipe/create/assembly'
import StonecuttingParser from '../parser/recipe/vanilla/stonecutting'
import CuttingRecipeParser from '../parser/recipe/farmersdelight/cutting'
import CookingRecipeParser from '../parser/recipe/farmersdelight/cooking'

export interface RecipeRegistry {
   forEach(consumer: (recipe: Recipe, id: Id) => void): void
}

export default class RecipeLoader implements RecipeRegistry {
   private readonly recipeParsers = new Map<string, RecipeParser<RecipeDefinition, Recipe>>()

   private readonly ignoredRecipeTypes = new Set<string>()
   private readonly unknownRecipeTypes = new Set<string>()

   private readonly recipes = new Map<Id, Recipe>()

   forEach(consumer: (recipe: Recipe, id: Id) => void) {
      this.recipes.forEach(consumer)
   }

   constructor(private readonly logger: Logger) {
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

      this.registerParser('farmersdelight:cooking', new CookingRecipeParser())
      this.registerParser('farmersdelight:cutting', new CuttingRecipeParser())
   }

   registerParser(recipeType: string, parser: RecipeParser<RecipeDefinition, Recipe>) {
      this.recipeParsers.set(recipeType, parser)
   }

   accept: Acceptor = (path, content) => {
      const match = /data\/(?<namespace>[\w-]+)\/recipes\/(?<rest>[\w-/]+).json/.exec(path)
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

   clear() {
      this.unknownRecipeTypes.clear()
   }
}
