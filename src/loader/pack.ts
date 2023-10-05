import { Acceptor, IResolver } from '@pssbletrngle/pack-resolver'
import match from 'minimatch'
import { Logger } from '../logger'
import Loader from './index'
import RecipeLoader from './recipe'
import TagsLoader from './tags'

export default class PackLoader implements Loader {
   constructor(private readonly logger: Logger) {}

   tags = new TagsLoader(this.logger)
   recipes = new RecipeLoader(this.logger, this.tags.registry('items'))

   private acceptors: Record<string, Acceptor> = {
      'data/*/tags/**/*.json': this.tags.accept,
      'data/*/recipes/**/*.json': this.recipes.accept,
   }

   async loadFrom(resolver: IResolver) {
      await resolver.extract((path, content) => {
         const acceptor = Object.entries(this.acceptors).find(([pattern]) => match(path, pattern))?.[1]
         if (!acceptor) return false
         return acceptor(path, content)
      })

      this.tags.freeze()
   }

   emit(acceptor: Acceptor) {
      this.recipes.emit(acceptor)
   }

   async run(from: IResolver, to: Acceptor) {
      await this.loadFrom(from)
      this.emit(to)
   }
}
