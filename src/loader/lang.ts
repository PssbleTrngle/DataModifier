import { Id } from '../common/id.js'
import { tryCatching } from '../error.js'
import { JsonLoader } from './index.js'
import { Logger } from '../logger.js'
import { LangDefinition, LangSchema } from '../schema/lang.js'

export default class LangLoader extends JsonLoader<LangDefinition> {
   protected parse(logger: Logger, json: unknown, id: Id): LangDefinition | null {
      return tryCatching(logger.group(`unable to parse lang file ${id.path}`), () => {
         const parsed = LangSchema.parse(json)
         const existing = this.registry.get(id)
         if (!existing) return parsed
         return { ...existing, ...parsed }
      })
   }
}
