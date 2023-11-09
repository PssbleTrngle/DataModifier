import { Acceptor, IResolver, ResolverInfo } from '@pssbletrngle/pack-resolver'
import match from 'minimatch'
import { createIngredient, IngredientInput, IngredientTest } from '../common/ingredient.js'
import BlacklistEmitter, { BlacklistRules } from '../emit/blacklist.js'
import LangEmitter, { LangRules } from '../emit/lang.js'
import LootTableEmitter, { LootRules } from '../emit/loot.js'
import RecipeEmitter, { RecipeRules } from '../emit/recipe.js'
import TagEmitter, { TagEmitterOptions, TagRules } from '../emit/tags.js'
import { Logger } from '../logger.js'
import Loader, { AcceptorWithLoader } from './index.js'
import LangLoader from './lang.js'
import LootTableLoader from './loot.js'
import RecipeLoader, { RecipeLoaderAccessor } from './recipe.js'
import RegistryDumpLoader from './registry/dump.js'
import RegistryLookup from './registry/index.js'
import TagsLoader from './tags.js'
import EmptyRegistryLookup from './registry/empty.js'
import { createResult, ResultInput } from '../common/result.js'
import { RegistryId } from '@pssbletrngle/data-modifier/generated'

export interface PackLoaderOptions extends TagEmitterOptions {}

export default class PackLoader implements Loader {
   constructor(private readonly logger: Logger, private readonly options: PackLoaderOptions = {}) {}

   private activeRegistryLookup: RegistryLookup = new EmptyRegistryLookup()

   private readonly tagLoader = new TagsLoader(() => this.activeRegistryLookup)
   private readonly recipesLoader = new RecipeLoader()
   private readonly lootLoader = new LootTableLoader()
   private readonly langLoader = new LangLoader()

   private readonly tagEmitter = new TagEmitter(this.logger, this.tagLoader, this.options)
   private readonly recipeEmitter = new RecipeEmitter(
      this.logger,
      this.recipesLoader,
      this.tagLoader,
      () => this.activeRegistryLookup
   )
   private readonly lootEmitter = new LootTableEmitter(
      this.logger,
      this.lootLoader,
      this.tagLoader,
      () => this.activeRegistryLookup
   )
   private readonly langEmitter = new LangEmitter(this.langLoader)
   private readonly blacklistEmitter = new BlacklistEmitter(
      this.logger,
      this.tagLoader,
      () => this.activeRegistryLookup
   )

   registerRegistry(key: string) {
      this.tagLoader.registerRegistry(key)
   }

   tagRegistry<T extends RegistryId>(key: T) {
      return this.tagLoader.registry(key)
   }

   get tags(): TagRules {
      return this.tagEmitter
   }

   get recipes(): RecipeRules {
      return this.recipeEmitter
   }

   get loot(): LootRules {
      return this.lootEmitter
   }

   get lang(): LangRules {
      return this.langEmitter
   }

   get recipeLoader(): RecipeLoaderAccessor {
      return this.recipesLoader
   }

   get blacklist(): BlacklistRules {
      return this.blacklistEmitter
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
      return this.recipeEmitter.resolveIngredientTest(test)
   }

   private acceptors: Record<string, AcceptorWithLoader> = {
      'data/*/tags/**/*.json': this.tagLoader.accept,
      'data/*/recipes/**/*.json': this.recipesLoader.accept,
      'data/*/loot_tables/**/*.json': this.lootLoader.accept,
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

      this.recipeEmitter.clear()
      this.lootEmitter.clear()
      this.tagEmitter.clear()
      this.langEmitter.clear()
      this.blacklistEmitter.clear()
   }

   async emit(acceptor: Acceptor) {
      await Promise.all([
         this.recipeEmitter.emit(acceptor),
         this.lootEmitter.emit(acceptor),
         this.tagEmitter.emit(acceptor),
         this.langEmitter.emit(acceptor),
         this.blacklistEmitter.emit(acceptor),
      ])
   }

   async run(from: IResolver, to: Acceptor) {
      await this.loadFrom(from)
      await this.emit(to)
   }
}
