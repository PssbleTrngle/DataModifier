import Rule from '../rule/index.js'
import { Acceptor } from '@pssbletrngle/pack-resolver'
import { toJson } from '../textHelper.js'
import Registry from '../common/registry.js'
import { PathProvider, RegistryProvider } from './index.js'
import { Logger } from '../logger.js'
import { Id } from '../common/id.js'

export default class RuledEmitter<TEntry, TRule extends Rule<TEntry>> {
   constructor(
      private readonly logger: Logger,
      private readonly provider: RegistryProvider<TEntry>,
      private readonly pathProvider: PathProvider,
      private readonly emptyValue: unknown,
      private readonly shouldSkip: (id: Id) => boolean = () => true
   ) {}

   private customEntries = new Registry<TEntry>()
   private rulesArray: TRule[] = []

   protected get rules(): ReadonlyArray<TRule> {
      return this.rulesArray
   }

   clear() {
      this.rulesArray = []
   }

   addRule(rule: TRule) {
      this.rulesArray.push(rule)
   }

   async emit(acceptor: Acceptor) {
      this.provider.forEach((recipe, id) => {
         if (this.shouldSkip(id)) return

         const path = this.pathProvider(id)

         const rules = this.rules.filter(it => it.matches(id, recipe, this.logger))
         if (rules.length === 0) return

         const modified = rules.reduce<TEntry | null>((previous, rule) => previous && rule.modify(previous), recipe)

         acceptor(path, toJson(modified ?? this.emptyValue))
      })
   }
}
