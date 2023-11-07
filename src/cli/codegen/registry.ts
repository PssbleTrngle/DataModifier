import { join, resolve } from 'path'
import RegistryLookup from '../../loader/registry/index.js'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { createId, encodeId, Id, IdInput } from '../../common/id.js'
import { camelCase } from 'lodash-es'
import { format } from 'prettier'

const module = '@pssbletrngle/data-modifier/generated'

function idPath(id: Id) {
   return `${id.path.replaceAll('/', '_')}`
}

function idType(id: Id) {
   const cased = camelCase(id.path.replaceAll('/', ' '))
   return cased.charAt(0).toUpperCase() + cased.substring(1)
}

function idTemplate(type: string, values: string[]) {
   return `
        export type ${type}Id = ${values.map(it => `'${it}'`).join(' | ')}
   `
}

function inferRegistryTemplate(keys: IdInput<string>[]) {
   return `
        export type InferIds<T extends RegistryId> = {
            ${keys.map(it => `'${encodeId(it)}': ${idType(createId(it))}Id`).join('\n')}
        }[T]
      `
}

function moduleTemplate(...content: string[]) {
   const replaced = `
        declare module '${module}' {
            ${content.join('\n\n')}
        }`

   return format(replaced, { parser: 'typescript' })
}

export function generateRegistryTypes(lookup: RegistryLookup, outputDirectory = '.') {
   const typesDirectory = resolve(outputDirectory, '@types', 'generated')
   if (!existsSync(typesDirectory)) mkdirSync(typesDirectory, { recursive: true })

   const registryBlock = idTemplate('Registry', lookup.registries())
   const inferIdBlock = inferRegistryTemplate(lookup.registries())

   const idBlocks = lookup
      .registries()
      .map(createId)
      .filter(it => it.namespace === 'minecraft')
      .map(id => {
         const keys = [...lookup.keys(id)!].sort()
         const type = idType(id)
         return idTemplate(type, keys)
      })

   writeFileSync(join(typesDirectory, 'index.d.ts'), moduleTemplate(registryBlock, ...idBlocks, inferIdBlock))
}
