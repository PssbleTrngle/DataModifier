import { Acceptor } from '@pssbletrngle/pack-resolver'
import { Logger } from '../logger.js'
import RecipeParser, { Recipe } from '../parser/recipe/index.js'
import ShapedParser from '../parser/recipe/vanilla/shaped.js'
import { RecipeDefinition } from '../schema/recipe.js'
import { Id } from '../common/id.js'
import ShapelessParser from '../parser/recipe/vanilla/shapeless.js'
import CreateProcessingRecipeParser from '../parser/recipe/create/processing.js'
import { fromJson } from '../textHelper.js'
import SmeltingParser from '../parser/recipe/vanilla/smelting.js'
import SmithingParser from '../parser/recipe/vanilla/smithing.js'
import AssemblyRecipeParser from '../parser/recipe/create/assembly.js'
import StonecuttingParser from '../parser/recipe/vanilla/stonecutting.js'
import CuttingRecipeParser from '../parser/recipe/farmersdelight/cutting.js'
import CookingRecipeParser from '../parser/recipe/farmersdelight/cooking.js'
import ThermalRecipeParser from '../parser/recipe/thermal/index.js'
import ThermalCatalystRecipeParser from '../parser/recipe/thermal/catalyst.js'
import NbtWrapperRecipeParser from '../parser/recipe/botania/nbtWrapper.js'
import OrechidRecipeParser from '../parser/recipe/botania/orechid.js'
import RunicAltarRecipeParser from '../parser/recipe/botania/runicAltar.js'
import ElvenTradeRecipeParser from '../parser/recipe/botania/elvenTrade.js'
import BrewRecipeParser from '../parser/recipe/botania/brew.js'
import ManaInfusionRecipeParser from '../parser/recipe/botania/manaInfusion.js'
import GogWrapperRecipeParser from '../parser/recipe/botania/gogWrapper.js'
import ApothecaryRecipeParser from '../parser/recipe/botania/apothecary.js'
import Registry from '../common/registry.js'
import TerraPlateRecipeParser from '../parser/recipe/botania/terraPlate.js'
import PureDaisyRecipeParser from '../parser/recipe/botania/pureDaisy.js'
import { RegistryProvider } from '../emit/index.js'

export default class RecipeLoader implements RegistryProvider<Recipe> {
   private readonly recipeParsers = new Map<string, RecipeParser<RecipeDefinition, Recipe>>()

   private readonly ignoredRecipeTypes = new Set<string>()
   private readonly unknownRecipeTypes = new Set<string>()

   private readonly recipes = new Registry<Recipe>()

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

      this.registerParser('create:mixing', new CreateProcessingRecipeParser())
      this.registerParser('create:pressing', new CreateProcessingRecipeParser())
      this.registerParser('create:emptying', new CreateProcessingRecipeParser())
      this.registerParser('create:crushing', new CreateProcessingRecipeParser())
      this.registerParser('create:milling', new CreateProcessingRecipeParser())
      this.registerParser('create:compacting', new CreateProcessingRecipeParser())
      this.registerParser('create:filling', new CreateProcessingRecipeParser())
      this.registerParser('create:cutting', new CreateProcessingRecipeParser())
      this.registerParser('create:item_application', new CreateProcessingRecipeParser())
      this.registerParser('create:sandpaper_polishing', new CreateProcessingRecipeParser())
      this.registerParser('create:deploying', new CreateProcessingRecipeParser())
      this.registerParser('create:splashing', new CreateProcessingRecipeParser())
      this.registerParser('create:haunting', new CreateProcessingRecipeParser())
      this.registerParser('create:mechanical_crafting', new ShapedParser())
      this.registerParser('create:sequenced_assembly', new AssemblyRecipeParser())

      this.registerParser('farmersdelight:cooking', new CookingRecipeParser())
      this.registerParser('farmersdelight:cutting', new CuttingRecipeParser())

      this.registerParser('thermal:bottler', new ThermalRecipeParser())
      this.registerParser('thermal:centrifuge', new ThermalRecipeParser())
      this.registerParser('thermal:chiller', new ThermalRecipeParser())
      this.registerParser('thermal:crucible', new ThermalRecipeParser())
      this.registerParser('thermal:crystallizer', new ThermalRecipeParser())
      this.registerParser('thermal:furnace', new ThermalRecipeParser())
      this.registerParser('thermal:insolator', new ThermalRecipeParser())
      this.registerParser('thermal:insolator_catalyst', new ThermalCatalystRecipeParser())
      this.registerParser('thermal:press', new ThermalRecipeParser())
      this.registerParser('thermal:pulverizer', new ThermalRecipeParser())
      this.registerParser('thermal:pulverizer_recycle', new ThermalRecipeParser())
      this.registerParser('thermal:pulverizer_catalyst', new ThermalCatalystRecipeParser())
      this.registerParser('thermal:pyrolyzer', new ThermalRecipeParser())
      this.registerParser('thermal:refinery', new ThermalRecipeParser())
      this.registerParser('thermal:sawmill', new ThermalRecipeParser())
      this.registerParser('thermal:smelter', new ThermalRecipeParser())
      this.registerParser('thermal:smelter_recycle', new ThermalRecipeParser())
      this.registerParser('thermal:smelter_catalyst', new ThermalCatalystRecipeParser())

      this.registerParser('botania:nbt_output_wrapper', new NbtWrapperRecipeParser(this))
      this.registerParser('botania:orechid', new OrechidRecipeParser())
      this.registerParser('botania:orechid_ignem', new OrechidRecipeParser())
      this.registerParser('botania:marimorphosis', new OrechidRecipeParser())
      this.registerParser('botania:pure_daisy', new PureDaisyRecipeParser())
      this.registerParser('botania:state_copying_pure_daisy', new PureDaisyRecipeParser())
      this.registerParser('botania:mana_upgrade', new ShapedParser())
      this.registerParser('botania:water_bottle_matching_shaped', new ShapedParser())
      this.registerParser('botania:runic_altar', new RunicAltarRecipeParser())
      this.registerParser('botania:runic_altar_head', new RunicAltarRecipeParser())
      this.registerParser('botania:terra_plate', new TerraPlateRecipeParser())
      this.registerParser('botania:elven_trade', new ElvenTradeRecipeParser())
      this.registerParser('botania:brew', new BrewRecipeParser())
      this.registerParser('botania:twig_wand', new ShapedParser())
      this.registerParser('botania:mana_infusion', new ManaInfusionRecipeParser())
      this.registerParser('botania:mana_upgrade_shapeless', new ShapelessParser())
      this.registerParser('botania:armor_upgrade', new ShapedParser())
      this.registerParser('botania:gog_alternation', new GogWrapperRecipeParser(this))
      this.registerParser('botania:petal_apothecary', new ApothecaryRecipeParser())

      this.ignoredRecipeTypes.add('immersiveengineering:cloche')
      this.ignoredRecipeTypes.add('immersiveengineering:crusher')
      this.ignoredRecipeTypes.add('immersiveengineering:fermenter')
      this.ignoredRecipeTypes.add('immersiveengineering:metal_press')
      this.ignoredRecipeTypes.add('immersiveengineering:squeezer')
   }

   parse<TDefinition extends RecipeDefinition, TRecipe extends Recipe<TDefinition>>(
      definition: TDefinition
   ): TRecipe | null {
      const parser = this.recipeParsers.get(definition.type)

      if (!('type' in definition)) return null
      if (Object.keys(definition).length <= 1) return null
      if (this.ignoredRecipeTypes.has(definition.type)) return null

      if (!parser) {
         if (!this.unknownRecipeTypes.has(definition.type)) {
            this.logger.warn(`unknown recipe type: '${definition.type}'`, definition)
            this.unknownRecipeTypes.add(definition.type)
         }
         return null
      }

      try {
         return parser.create(definition) as TRecipe
      } catch (e) {
         throw new Error(`Failed to parse recipe with type '${definition.type}'`, { cause: e })
      }
   }

   registerParser(recipeType: string, parser: RecipeParser<RecipeDefinition, Recipe>) {
      this.recipeParsers.set(recipeType, parser)
   }

   readonly accept: Acceptor = (path, content) => {
      const match = /data\/(?<namespace>[\w-]+)\/recipes\/(?<rest>[\w-/]+).json/.exec(path)
      if (!match?.groups) return false

      const { namespace, rest } = match.groups
      const id: Id = { namespace, path: rest }

      const parsed: RecipeDefinition = fromJson(content.toString())

      const recipe = this.parse(parsed)
      if (!recipe) return false

      this.recipes.set(id, recipe)

      return true
   }

   clear() {
      this.unknownRecipeTypes.clear()
   }
}
