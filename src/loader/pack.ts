import { RegistryId } from '@pssbletrngle/data-modifier/generated'
import { Acceptor, IResolver, ResolverInfo } from '@pssbletrngle/pack-resolver'
import match from 'minimatch'
import { createIngredient, IngredientInput, IngredientTest } from '../common/ingredient.js'
import { createResult, ResultInput } from '../common/result.js'
import BlockstateEmitter, { BlockstateRules } from '../emit/assets/blockstates.js'
import LangEmitter, { LangRules } from '../emit/assets/lang.js'
import ModelEmitter, { ModelRulesGroup } from '../emit/assets/models.js'
import BlacklistEmitter, { BlacklistOptions, BlacklistRules } from '../emit/blacklist.js'
import BlockDefinitionEmitter, { BlockDefinitionRules } from '../emit/content/blockDefinition.js'
import ItemDefinitionEmitter, { ItemDefinitionRules } from '../emit/content/itemDefinition.js'
import LootTableEmitter, { LootRules } from '../emit/data/loot.js'
import RecipeEmitter, { RecipeRules } from '../emit/data/recipe.js'
import TagEmitter, { TagEmitterOptions, TagRules } from '../emit/data/tags.js'
import { ClearableEmitter } from '../emit/index.js'
import { Logger } from '../logger.js'
import Loader, { AcceptorWithLoader } from './index.js'
import LangLoader from './lang.js'
import LootTableLoader from './loot.js'
import RecipeLoader, { RecipeLoaderAccessor } from './recipe.js'
import RegistryDumpLoader from './registry/dump.js'
import EmptyRegistryLookup from './registry/empty.js'
import RegistryLookup from './registry/index.js'
import TagsLoader from './tags.js'

export interface PackLoaderOptions extends TagEmitterOptions, BlacklistOptions {
   packFormat: number
}

export default class PackLoader implements Loader, ClearableEmitter {
   constructor(private readonly logger: Logger, private readonly options: PackLoaderOptions) {}

   private readonly emitters: ClearableEmitter[] = []

   registerEmitter<T extends ClearableEmitter>(emitter: T): T {
      this.emitters.push(emitter)
      return emitter
   }

   private activeRegistryLookup: RegistryLookup = new EmptyRegistryLookup()

   private readonly tagLoader = new TagsLoader(() => this.activeRegistryLookup)
   private readonly recipesLoader = new RecipeLoader()
   private readonly lootLoader = new LootTableLoader()
   private readonly langLoader = new LangLoader()

   readonly tags: TagRules = this.registerEmitter(new TagEmitter(this.logger, this.tagLoader, this.options))
   readonly recipes: RecipeRules = this.registerEmitter(
      new RecipeEmitter(
         this.logger,
         this.recipesLoader,
         this.tagLoader,
         () => this.activeRegistryLookup,
         this.options.packFormat
      )
   )
   readonly loot: LootRules = this.registerEmitter(
      new LootTableEmitter(
         this.logger,
         this.lootLoader,
         this.tagLoader,
         () => this.activeRegistryLookup,
         this.options.packFormat
      )
   )
   readonly lang: LangRules = this.registerEmitter(new LangEmitter(this.langLoader))
   readonly blacklist: BlacklistRules = this.registerEmitter(
      new BlacklistEmitter(this.logger, this.tagLoader, () => this.activeRegistryLookup, this.options)
   )

   readonly blockstates: BlockstateRules = this.registerEmitter(new BlockstateEmitter())
   readonly models: ModelRulesGroup = {
      blocks: this.registerEmitter(new ModelEmitter('block')),
      items: this.registerEmitter(new ModelEmitter('item')),
   }

   private readonly itemDefinition: ItemDefinitionRules = this.registerEmitter(
      new ItemDefinitionEmitter(this.models, this.blockstates, this.loot)
   )
   private readonly blockDefinition: BlockDefinitionRules = this.registerEmitter(
      new BlockDefinitionEmitter(this.models.blocks, this.blockstates, this.loot)
   )

   registerRegistry(key: string) {
      this.tagLoader.registerRegistry(key)
   }

   tagRegistry<T extends RegistryId>(key: T) {
      return this.tagLoader.registry(key)
   }

   get content(): Readonly<{
      blocks: BlockDefinitionRules
      items: ItemDefinitionRules
   }> {
      return {
         blocks: this.blockDefinition,
         items: this.itemDefinition,
      }
   }

   get recipeLoader(): RecipeLoaderAccessor {
      return this.recipesLoader
   }

   get registries(): RegistryLookup {
      return this.activeRegistryLookup
   }

   createResult(input: ResultInput) {
      return createResult(input, this.activeRegistryLookup)
   }

   createIngredient(input: IngredientInput) {
      return createIngredient(input, this.activeRegistryLookup)
   }

   resolveIngredientTest(test: IngredientTest) {
      return this.recipes.resolveIngredientTest(test)
   }

   private acceptors: Record<string, AcceptorWithLoader> = {
      'data/*/tags/**/*.json': this.tagLoader.accept,
      'data/*/recipes/**/*.json': this.recipesLoader.accept,
      'data/*/recipe/**/*.json': this.recipesLoader.accept,
      'data/*/loot_tables/**/*.json': this.lootLoader.accept,
      'data/*/loot_table/**/*.json': this.lootLoader.accept,
      'assets/*/lang/*.json': this.langLoader.accept,
   }

   private loadInternal(resolver: IResolver, logger: Logger) {
      return resolver.extract((path, content) => {
         const acceptor = Object.entries(this.acceptors).find(([pattern]) => match(path, pattern))?.[1]
         if (!acceptor) return false
         return acceptor(logger, path, content)
      })
   }

   async loadFromMultiple(resolvers: ResolverInfo[]) {
      await Promise.all(
         resolvers.map(({ resolver, name }) => {
            const logger = this.logger.group(name)
            return this.loadInternal(resolver, logger)
         })
      )

      this.freeze()
   }

   async loadFrom(resolver: IResolver) {
      await this.loadInternal(resolver, this.logger)
      this.freeze()
   }

   async loadRegistryDump(resolver: IResolver) {
      const registryDumpLoader = new RegistryDumpLoader(this.logger)
      await registryDumpLoader.extract(resolver)
      this.activeRegistryLookup = registryDumpLoader
   }

   private freeze() {
      this.tagLoader.freeze()
   }

   clear() {
      this.recipesLoader.clear()
      this.activeRegistryLookup = new EmptyRegistryLookup()

      this.emitters.forEach(it => it.clear())
   }

   async emit(acceptor: Acceptor) {
      await Promise.all(this.emitters.map(it => it.emit(acceptor)))
   }

   async run(from: IResolver, to: Acceptor) {
      await this.loadFrom(from)
      await this.emit(to)
   }
}
