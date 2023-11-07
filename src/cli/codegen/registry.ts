import { join, resolve } from 'path'
import RegistryLookup from '../../loader/registry/index.js'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { createId, encodeId, Id, IdInput } from '../../common/id.js'
import { camelCase } from 'lodash-es'
import { format } from 'prettier'

const module = '@pssbletrngle/data-modifier/generated'

function idType(id: Id) {
   const cased = camelCase(id.path.replaceAll('/', ' '))
   return cased.charAt(0).toUpperCase() + cased.substring(1)
}

function idTemplate(type: string, values: string[]) {
   return `
        export type ${type}Id = ${values.map(it => `'${it}'`).join(' | ')}
   `
}

function inferRegistryTemplate(keys: IdInput[]) {
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

function createTypesDirectory(base: string) {
   const dir = resolve(base, '@types', 'generated')
   if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
   return dir
}

export function generateRegistryTypes(lookup: RegistryLookup, outputDirectory: string) {
   const typesDirectory = createTypesDirectory(outputDirectory)

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

export function generateStubTypes(outputDirectory: string) {
   const typesDirectory = createTypesDirectory(outputDirectory)
   const registryStub = resolve(typesDirectory, 'index.d.ts')

   writeFileSync(
      registryStub,
      format(
         `
         declare module '@pssbletrngle/data-modifier/generated' {
            export type RegistryId = string
         
            export type InferIds<T extends RegistryId> = string
         
            export type ItemId = string
         
            export type BlockId = string
         
            export type FluidId = string
         
            export type RecipeSerializerId = string
         }`,
         { parser: 'typescript' }
      )
   )
}
