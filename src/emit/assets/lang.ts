import { InferIds, RegistryId } from '@pssbletrngle/data-modifier/generated'
import { Acceptor, arrayOrSelf } from '@pssbletrngle/pack-resolver'
import { mapValues, omitBy } from 'lodash-es'
import { Id, IdInput, createId, encodeId } from '../../common/id.js'
import { Predicate } from '../../common/ingredient.js'
import Registry from '../../common/registry.js'
import { Replacer } from '../../parser/recipe/index.js'
import { LangDefinition } from '../../schema/assets/lang.js'
import { toJson } from '../../textHelper.js'
import { ClearableEmitter, RegistryProvider } from '../index.js'

type LangRule = Readonly<{
   languages: string[]
   mods: string[]
   key?: Predicate<string>
   value?: Predicate<string>
   replacer: Replacer<string>
}>

type ReplaceOptions = Readonly<{
   matchCase?: boolean
   keepCase?: boolean
   lang?: string | string[]
   mod?: string | string[]
}>

type EntryOptions = { lang?: string }

export interface LangRules {
   replaceValue(match: string, value: string, options?: ReplaceOptions): void

   replaceValue(match: RegExp, value: string, options?: Omit<ReplaceOptions, 'matchCase'>): void

   addCustom(file: IdInput, key: string, value: string): void

   entryName<T extends RegistryId>(registry: T, id: IdInput<InferIds<T>>, value: string, options?: EntryOptions): void
}

export default class LangEmitter implements LangRules, ClearableEmitter {
   private custom = new Registry<LangDefinition>()
   private rules: LangRule[] = []

   constructor(private readonly registry: RegistryProvider<LangDefinition>) {}

   async emit(acceptor: Acceptor) {
      const missingCustomFiles = new Set(this.custom.keys())

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

         const custom = this.custom.get(id) ?? {}

         const output = {
            ...replaced,
            ...custom,
         }

         if (Object.keys(output).length > 0) {
            missingCustomFiles.delete(encodeId(id))
            const path = this.langPath(id)
            acceptor(path, toJson(output))
         }
      })

      missingCustomFiles.forEach(id => {
         const path = this.langPath(createId(id))
         acceptor(path, toJson(this.custom.get(id)))
      })
   }

   clear() {
      this.rules = []
      this.custom.clear()
   }

   private langPath(id: Id) {
      return `assets/${id.namespace}/lang/${id.path}.json`
   }

   replaceValue(match: string | RegExp, value: string, options: ReplaceOptions = {}) {
      const languages = arrayOrSelf(options.lang)
      const mods = arrayOrSelf(options.mod)
      const matcher: (it: string) => string = options.keepCase === false ? () => value : keepCaseMatcher(value)

      if (typeof match === 'string') {
         if (options.matchCase) {
            this.rules.push({
               languages,
               mods,
               value: it => it.includes(match),
               replacer: it => it.replaceAll(match, matcher),
            })
         } else {
            this.replaceValue(new RegExp(match, 'i'), value, options)
         }
      } else {
         this.rules.push({ languages, mods, value: it => match.test(it), replacer: it => it.replace(match, matcher) })
      }
   }

   addCustom(file: IdInput, key: string, value: string) {
      const definition = this.custom.getOrPut(file, () => ({}))
      definition[key] = value
   }

   entryName<T extends RegistryId>(registry: T, id: IdInput<InferIds<T>>, value: string, { lang }: EntryOptions = {}) {
      const { namespace, path } = createId(id)
      const file = createId({ namespace, path: lang ?? 'en_us' })
      const { path: registryPath } = createId(registry)
      this.addCustom(file, `${registryPath}.${namespace}.${path}`, value)
   }
}

// Taken from https://stackoverflow.com/questions/17264639/replace-text-but-keep-case
function keepCaseMatcher(replaceValue: string) {
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
