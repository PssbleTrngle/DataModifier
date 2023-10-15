import { Acceptor, IResolver, ResolverInfo } from '@pssbletrngle/pack-resolver'
import match from 'minimatch'
import { Logger } from '../logger.js'
import Loader, { AcceptorWithLoader } from './index.js'
import RecipeLoader, { RecipeLoaderAccessor } from './recipe.js'
import TagsLoader from './tags.js'
import RecipeEmitter, { RecipeRules } from '../emit/recipe.js'
import TagEmitter, { TagRules } from '../emit/tags.js'
import { IngredientTest } from '../common/ingredient.js'
import LootTableLoader from './loot.js'
import LootTableEmitter, { LootRules } from '../emit/loot.js'
import LangLoader from './lang.js'
import LangEmitter, { LangRules } from '../emit/lang.js'

export default class PackLoader implements Loader {
   constructor(private readonly logger: Logger) {}

   private readonly tagLoader = new TagsLoader()
   private readonly recipesLoader = new RecipeLoader()
   private readonly lootLoader = new LootTableLoader()
   private readonly langLoader = new LangLoader()

   private readonly tagEmitter = new TagEmitter(this.logger, this.tagLoader)
   private readonly recipeEmitter = new RecipeEmitter(this.logger, this.recipesLoader, this.tagLoader)
   private readonly lootEmitter = new LootTableEmitter(this.logger, this.lootLoader, this.tagLoader)
   private readonly langEmitter = new LangEmitter(this.langLoader)

   registerRegistry(key: string) {
      this.tagLoader.registerRegistry(key)
   }

   tagRegistry(key: string) {
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

   private freeze() {
      this.tagLoader.freeze()
   }

   clear() {
      this.recipesLoader.clear()
      this.recipeEmitter.clear()
      this.lootEmitter.clear()
      this.tagEmitter.clear()
      this.langEmitter.clear()
   }

   async emit(acceptor: Acceptor) {
      await Promise.all([
         this.recipeEmitter.emit(acceptor),
         this.lootEmitter.emit(acceptor),
         this.tagEmitter.emit(acceptor),
         this.langEmitter.emit(acceptor),
      ])
   }

   async run(from: IResolver, to: Acceptor) {
      await this.loadFrom(from)
      await this.emit(to)
   }
}
