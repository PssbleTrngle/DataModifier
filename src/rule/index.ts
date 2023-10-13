import { Id } from '../common/id.js'
import { Logger } from '../logger.js'

export type Modifier<T> = (recipe: T) => T | null

export default abstract class Rule<T> {
   protected constructor(private readonly modifier: Modifier<T>) {}

   abstract matches(id: Id, recipe: T, logger: Logger): boolean

   modify(value: T) {
      return this.modifier(value)
   }
}
