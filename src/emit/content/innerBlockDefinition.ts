import { AbstractBlockDefinitionRules, BlockDefinitionRules } from './blockDefinition.js'
import { ModelRules } from '../assets/models.js'
import { LootRules } from '../data/loot.js'
import { BlockstateRules } from '../assets/blockstates.js'
import { BlockDefinition } from '../../schema/content/blockDefinition.js'
import { IdInput } from '../../common/id.js'

/* eslint-disable @typescript-eslint/no-explicit-any */

class InnerBlockDefinitionRules extends AbstractBlockDefinitionRules {
   add<T extends BlockDefinition>(id: IdInput, definition: T): T {
      return definition
   }
}

type CurriedFunction<TRest extends unknown[], TReturn> = (...args: TRest) => TReturn
type InferCurriedFunction<T> = T extends (sliced: any, ...args: infer TRest) => infer TReturn
   ? CurriedFunction<TRest, TReturn>
   : never

function curry<T extends (sliced: TSliced, ...args: TRest) => TReturn, TSliced, TRest extends any[], TReturn>(
   func: T,
   dummy: TSliced
) {
   return function (this: unknown, ...args: TRest) {
      return func.call(this, dummy, ...args)
   } as InferCurriedFunction<T>
}

export type BlockDefinitionRulesWithoutId = {
   [K in keyof BlockDefinitionRules]: InferCurriedFunction<BlockDefinitionRules[K]>
}

/**
 * Modifies emitter
 */
function createCurriedEmitter(emitter: BlockDefinitionRules) {
   const methods = Object.getOwnPropertyNames(AbstractBlockDefinitionRules.prototype).filter(
      it => it !== 'constructor'
   ) as Array<keyof AbstractBlockDefinitionRules>

   const out = emitter as any

   methods.forEach(key => {
      const func = emitter[key]
      if (typeof func === 'function') {
         out[key] = curry(func, '').bind(emitter)
      }
   })

   return out as BlockDefinitionRulesWithoutId
}

/* eslint-enable @typescript-eslint/no-explicit-any */

export default function createInnerBlockDefinitionBuilder(
   models: ModelRules,
   blockstates: BlockstateRules,
   loot: LootRules
) {
   const inner = new InnerBlockDefinitionRules(models, blockstates, loot)
   return createCurriedEmitter(inner)
}
