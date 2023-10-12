import { Acceptor, IResolver } from '@pssbletrngle/pack-resolver'
import match from 'minimatch'
import { Logger } from '../logger'
import Loader from './index'
import RecipeLoader from './recipe'
import TagsLoader from './tags'
import RecipeEmitter, { RecipeRules } from '../emit/recipe'
import TagEmitter, { TagRules } from '../emit/tags'
import { IngredientTest } from '../common/ingredient'
import LootTableLoader from './loot'
import LootTableEmitter, { LootRules } from '../emit/loot'

export default class PackLoader implements Loader {
   constructor(private readonly logger: Logger) {}

   private readonly tagLoader = new TagsLoader(this.logger)
   private readonly recipesLoader = new RecipeLoader(this.logger)
   private readonly lootLoader = new LootTableLoader(this.logger)

   private readonly tagEmitter = new TagEmitter(this.logger, this.tagLoader)
   private readonly recipeEmitter = new RecipeEmitter(this.logger, this.recipesLoader, this.tagLoader)
   private readonly lootEmitter = new LootTableEmitter(this.logger, this.lootLoader, this.tagLoader)

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

   resolveIngredientTest(test: IngredientTest) {
      return this.recipeEmitter.resolveIngredientTest(test)
   }

   private acceptors: Record<string, Acceptor> = {
      'data/*/tags/**/*.json': this.tagLoader.accept,
      'data/*/recipes/**/*.json': this.recipesLoader.accept,
      'data/*/loot_tables/**/*.json': this.lootLoader.accept,
   }

   async loadFrom(resolver: IResolver) {
      await resolver.extract((path, content) => {
         const acceptor = Object.entries(this.acceptors).find(([pattern]) => match(path, pattern))?.[1]
         if (!acceptor) return false
         return acceptor(path, content)
      })

      this.tagLoader.freeze()
   }

   clear() {
      this.recipesLoader.clear()
      this.recipeEmitter.clear()
      this.lootEmitter.clear()
      this.tagEmitter.clear()
   }

   async emit(acceptor: Acceptor) {
      await Promise.all([
         this.recipeEmitter.emit(acceptor),
         this.lootEmitter.emit(acceptor),
         this.tagEmitter.emit(acceptor),
      ])
   }

   async run(from: IResolver, to: Acceptor) {
      await this.loadFrom(from)
      await this.emit(to)
   }
}
