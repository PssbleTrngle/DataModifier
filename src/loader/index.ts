import { Acceptor, IResolver } from '@pssbletrngle/pack-resolver'
import { Id } from '../common/id.js'
import { fromJson } from '../textHelper.js'
import Registry from '../common/registry.js'
import { RegistryProvider } from '../emit/index.js'
import { Logger } from '../logger.js'
import { tryCatching } from '../error.js'

export type AcceptorWithLoader = (logger: Logger, ...paramenters: Parameters<Acceptor>) => ReturnType<Acceptor>

export default interface Loader {
   loadFrom(resolver: IResolver): Promise<void>
}

export abstract class JsonLoader<T> implements RegistryProvider<T> {
   protected readonly registry = new Registry<T>()

   protected abstract parse(logger: Logger, json: unknown, id: Id): T | null

   forEach(consumer: (recipe: T, id: Id) => void): void {
      this.registry.forEach(consumer)
   }

   private tryParseJson(logger: Logger, content: string) {
      try {
         return fromJson(content)
      } catch (error) {
         if (error instanceof SyntaxError) {
            logger.warn(`unable to parse json: ${error.message}`)
            return null
         }
         throw error
      }
   }

   readonly accept: AcceptorWithLoader = (logger, path, content) => {
      const match = /(data|assets)\/(?<namespace>[\w-]+)\/\w+\/(?<rest>[\w-/]+).json/.exec(path)
      if (!match?.groups) return false

      const { namespace, rest } = match.groups
      const id: Id = { namespace, path: rest }

      const grouped = logger.group(path)

      const json = this.tryParseJson(grouped, content.toString())
      if (!json) return false

      const parsed = tryCatching(grouped, () => this.parse(grouped, json, id))
      if (!parsed) return false

      this.registry.set(id, parsed)

      return true
   }
}
