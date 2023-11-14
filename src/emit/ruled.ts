import Rule from './rule/index.js'
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
   private requiredRules = new Set<TRule>()

   protected get rules(): ReadonlyArray<TRule> {
      return this.rulesArray
   }

   clear() {
      this.rulesArray = []
      this.requiredRules.clear()
   }

   addRule(rule: TRule, required: boolean = true) {
      this.rulesArray.push(rule)
      if (required) this.requiredRules.add(rule)
   }

   async emit(acceptor: Acceptor) {
      const missingRules = new Set<TRule>(this.requiredRules)
      this.provider.forEach((recipe, id) => {
         if (this.shouldSkip(id)) return

         const path = this.pathProvider(id)

         const rules = this.rules.filter(it => it.matches(id, recipe, this.logger.group(path)))
         if (rules.length === 0) return

         rules.forEach(it => missingRules.delete(it))

         const modified = rules.reduce<TEntry | null>((previous, rule) => previous && rule.modify(previous), recipe)

         acceptor(path, toJson(modified ?? this.emptyValue))
      })

      missingRules.forEach(rule => {
         rule.printWarning(this.logger)
      })
   }
}
