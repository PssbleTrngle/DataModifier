import Rule, { Modifier } from './index'
import { LootTable } from '../schema/loot'
import { encodeId, Id } from '../common/id'
import { Logger } from '../logger'
import { Predicate } from '../common/ingredient'

export default class LootTableRule extends Rule<LootTable> {
   constructor(private readonly idTests: Predicate<Id>[], modifier: Modifier<LootTable>) {
      super(modifier)
   }

   matches(id: Id, recipe: LootTable, logger: Logger): boolean {
      const prefixed = logger.group(encodeId(id))
      return this.idTests.every(test => test(id, prefixed))
   }
}
