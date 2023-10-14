import { encodeId, Id } from '../common/id.js'
import { tryCatching } from '../error.js'
import { LootTable, LootTableSchema } from '../schema/loot.js'
import { JsonLoader } from './index.js'
import { Logger } from '../logger.js'

export default class LootTableLoader extends JsonLoader<LootTable> {
   protected parse(logger: Logger, json: unknown, id: Id): LootTable | null {
      return tryCatching(logger.group(`error parsing loot table ${encodeId(id)}`), () => {
         return LootTableSchema.parse(json)
      })
   }
}
