import { Id } from '../common/id.js'
import { JsonLoader } from './index.js'
import { Logger } from '../logger.js'
import { LangDefinition, LangSchema } from '../schema/assets/lang.js'

export default class LangLoader extends JsonLoader<LangDefinition> {
   protected parse(_: Logger, json: unknown, id: Id): LangDefinition | null {
      const parsed = LangSchema.parse(json)
      const existing = this.registry.get(id)
      if (!existing) return parsed
      return { ...existing, ...parsed }
   }
}
