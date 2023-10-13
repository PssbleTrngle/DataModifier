import { Logger } from '../logger.js'
import { Acceptor } from '@pssbletrngle/pack-resolver'
import { encodeId, Id } from '../common/id.js'
import { fromJson } from '../textHelper.js'
import Registry from '../common/registry.js'
import { tryCatching } from '../error.js'
import { RegistryProvider } from '../emit/index.js'
import { LootTable, LootTableSchema } from '../schema/loot.js'

export default class LootTableLoader implements RegistryProvider<LootTable> {
   private readonly registry = new Registry<LootTable>()

   constructor(private readonly logger: Logger) {}

   private parse(raw: unknown, id: Id): LootTable | null {
      const logger = this.logger.group(`error parsing loot table ${encodeId(id)}`)
      return tryCatching(logger, () => {
         return LootTableSchema.parse(raw)
      })
   }

   readonly accept: Acceptor = (path, content) => {
      // TODO extract common logic
      const match = /data\/(?<namespace>[\w-]+)\/loot_tables\/(?<rest>[\w-/]+).json/.exec(path)
      if (!match?.groups) return false

      const { namespace, rest } = match.groups
      const id: Id = { namespace, path: rest }

      const json = fromJson(content.toString())

      const parsed = this.parse(json, id)
      if (!parsed) return false

      this.registry.set(id, parsed)

      return true
   }

   forEach(consumer: (recipe: LootTable, id: Id) => void): void {
      this.registry.forEach(consumer)
   }
}
