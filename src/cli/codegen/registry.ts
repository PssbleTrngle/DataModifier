import { dirname, join, resolve } from 'path'
import RegistryLookup from '../../loader/registry/index.js'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { createId, encodeId, Id, IdInput } from '../../common/id.js'
import { camelCase } from 'lodash-es'
import { format } from 'prettier'

const module = '@pssbletrngle/data-modifier'

function idType(id: Id) {
   const cased = camelCase(id.path.replaceAll('/', ' '))
   return cased.charAt(0).toUpperCase() + cased.substring(1)
}

function idTemplate(type: string, values: string[]) {
   const replaced = `
         import '${module}'
      
         declare module '${module}' {
            export type ${type}Id = ${values.map(it => `'${it}'`).join(' | ')}
         }
      `

   return format(replaced, { parser: 'typescript' })
}

function inferRegistryTemplate(keys: IdInput<string>[]) {
   const replaced = `
         import '${module}'
      
         declare module '${module}' {
            export type InferIds<T extends RegistryId> = {
                ${keys.map(it => `'${encodeId(it)}': ${idType(createId(it))}Id`).join('\n')}
            }[T]
         }
      `

   return format(replaced, { parser: 'typescript' })
}

export function generateRegistryTypes(lookup: RegistryLookup, outputDirectory = '.') {
   const typesDirectory = resolve(outputDirectory, '@types')

   writeFileSync(join(typesDirectory, 'registries.d.ts'), idTemplate('Registry', lookup.registries()))
   writeFileSync(join(typesDirectory, 'ids.d.ts'), inferRegistryTemplate(lookup.registries()))

   lookup
      .registries()
      .map(createId)
      .filter(it => it.namespace === 'minecraft')
      .forEach(id => {
         const file = join(typesDirectory, `${id.path.replaceAll('/', '_')}.d.ts`)
         if (!existsSync(file)) mkdirSync(dirname(file), { recursive: true })

         const keys = [...lookup.keys(id)!].sort()
         const type = idType(id)

         const content = idTemplate(type, keys)

         writeFileSync(file, content)
      })
}
