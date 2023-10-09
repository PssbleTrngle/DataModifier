import { Acceptor, IResolver } from '@pssbletrngle/pack-resolver'
import match from 'minimatch'
import { Logger } from '../logger'
import Loader from './index'
import RecipeLoader from './recipe'
import TagsLoader, { TagRegistryHolder } from './tags'
import RecipeEmitter, { RecipeRules } from '../emit/recipe'
import TagEmitter, { TagRules } from '../emit/tags'

export default class PackLoader implements Loader {
   constructor(private readonly logger: Logger) {}

   private readonly tagLoader = new TagsLoader(this.logger)
   private readonly recipesLoader = new RecipeLoader(this.logger)

   private readonly recipeEmitter = new RecipeEmitter(this.logger, this.recipesLoader, this.tagLoader)
   private readonly tagEmitter = new TagEmitter(this.logger, this.tagLoader)

   registerRegistry(key: string) {
      this.tagLoader.registerRegistry(key)
   }

   get tagRegistry(): TagRegistryHolder {
      return this.tagLoader
   }

   get recipes(): RecipeRules {
      return this.recipeEmitter
   }

   get tags(): TagRules {
      return this.tagEmitter
   }

   private acceptors: Record<string, Acceptor> = {
      'data/*/tags/**/*.json': this.tagLoader.accept,
      'data/*/recipes/**/*.json': this.recipesLoader.accept,
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
      this.tagEmitter.clear()
   }

   async emit(acceptor: Acceptor) {
      await Promise.all([this.recipeEmitter.emit(acceptor), this.tagEmitter.emit(acceptor)])
   }

   async run(from: IResolver, to: Acceptor) {
      await this.loadFrom(from)
      await this.emit(to)
   }
}
