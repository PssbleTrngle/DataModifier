import { AcceptorWithLoader, tryParseJson } from './index.js'
import zod from 'zod'
import { tryCatching, UnknownRegistryEntry } from '../error.js'
import Registry from '../common/registry.js'
import { encodeId, IdInput, NormalizedId } from '../common/id.js'
import { Logger } from '../logger.js'
import { Ingredient } from '../common/ingredient.js'

const schema = zod.array(zod.string())

export interface RegistryLookup {
   keys(registry: IdInput): ReadonlySet<NormalizedId> | undefined

   isKnown(registry: IdInput): boolean

   validate(ingredient: Ingredient): void
}

export default class RegistryDumpLoader implements RegistryLookup {
   private readonly registry = new Registry<Set<NormalizedId>>()

   constructor(private readonly logger: Logger) {}

   readonly accept: AcceptorWithLoader = (logger, path, content) => {
      const match = /(?<registry>[\w-\\/]+)[\\/][\w-]+.json/.exec(path)
      if (!match?.groups) return false

      const { registry } = match.groups

      const grouped = logger.group(path)

      const json = tryParseJson(grouped, content.toString())
      if (!json) return false

      const parsed = tryCatching(grouped, () => schema.parse(json))
      if (!parsed) return false

      const set = this.registry.getOrPut(registry, () => new Set<NormalizedId>())
      parsed.map(encodeId).forEach(id => set.add(id))

      return true
   }

   keys(registry: IdInput) {
      const keys = this.registry.get(registry)
      if (keys === undefined) {
         this.logger.warn(`tried to access registry '${encodeId(registry)}', which has not been loaded`)
      }
      return keys
   }

   isKnown(registry: IdInput) {
      return this.registry.has(registry)
   }

   private validateEntry(registry: string, id: string) {
      const keys = this.keys(registry)
      if (!keys) return

      const normalizedId = encodeId(id)
      if (keys.has(normalizedId)) return

      throw new UnknownRegistryEntry(`unknown ${registry} '${normalizedId}'`, registry, normalizedId)
   }

   validate(ingredient: Ingredient) {
      if (Array.isArray(ingredient)) {
         ingredient.forEach(it => this.validate(it))
      }

      if ('item' in ingredient) this.validateEntry('minecraft:item', ingredient.item)
      if ('block' in ingredient) this.validateEntry('minecraft:block', ingredient.block)
      if ('fluid' in ingredient) this.validateEntry('minecraft:fluid', ingredient.fluid)
   }
}
