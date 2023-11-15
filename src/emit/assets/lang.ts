import { ClearableEmitter, RegistryProvider } from '../index.js'
import { LangDefinition } from '../../schema/assets/lang.js'
import { Acceptor, arrayOrSelf } from '@pssbletrngle/pack-resolver'
import { Predicate } from '../../common/ingredient.js'
import { Replacer } from '../../parser/recipe/index.js'
import { mapValues, omitBy } from 'lodash-es'
import { toJson } from '../../textHelper.js'

type LangRule = Readonly<{
   languages: string[]
   mods: string[]
   key?: Predicate<string>
   value?: Predicate<string>
   replacer: Replacer<string>
}>

type ReplaceOptions = Readonly<{
   matchCase?: boolean
   lang?: string | string[]
   mod?: string | string[]
}>

export interface LangRules {
   replaceValue(match: string, value: string, options?: ReplaceOptions): void
   replaceValue(match: RegExp, value: string, options?: Omit<ReplaceOptions, 'matchCase'>): void
}

export default class LangEmitter implements LangRules, ClearableEmitter {
   private rules: LangRule[] = []

   constructor(private readonly registry: RegistryProvider<LangDefinition>) {}

   async emit(acceptor: Acceptor) {
      this.registry.forEach((lang, id) => {
         const allRules = this.rules.filter(rule => {
            return (
               (rule.languages.length === 0 || rule.languages.includes(id.path)) &&
               (rule.mods.length === 0 || rule.mods.includes(id.namespace))
            )
         })

         const replaced = omitBy(
            mapValues(lang, (value, key) => {
               const rules = allRules.filter(rule => rule.key?.(key) || rule.value?.(value))
               if (rules.length === 0) return undefined
               return rules.reduce((previous, rule) => rule.replacer(previous), value)
            }),
            it => !it
         )

         if (Object.keys(replaced).length > 0) {
            const path = `assets/${id.namespace}/lang/${id.path}.json`
            acceptor(path, toJson(replaced))
         }
      })
   }

   clear() {
      this.rules = []
   }

   replaceValue(match: string | RegExp, value: string, options: ReplaceOptions = {}) {
      const languages = arrayOrSelf(options.lang)
      const mods = arrayOrSelf(options.mod)
      const matcher = matchCase(value)

      if (typeof match === 'string') {
         if (options.matchCase) {
            this.rules.push({
               languages,
               mods,
               value: it => it.includes(match),
               replacer: it => it.replaceAll(match, matcher),
            })
         } else {
            this.replaceValue(new RegExp(match, 'i'), value)
         }
      } else {
         this.rules.push({ languages, mods, value: it => match.test(it), replacer: it => it.replace(match, matcher) })
      }
   }
}

// Taken from https://stackoverflow.com/questions/17264639/replace-text-but-keep-case
function matchCase(replaceValue: string) {
   return (input: string) => {
      let result = ''

      for (let i = 0; i < replaceValue.length; i++) {
         const c = replaceValue.charAt(i)
         const p = input.charCodeAt(i)

         if (p >= 65 && p < 65 + 26) {
            result += c.toUpperCase()
         } else {
            result += c.toLowerCase()
         }
      }

      return result
   }
}
