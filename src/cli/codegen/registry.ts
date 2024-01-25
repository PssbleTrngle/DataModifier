import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { camelCase } from 'lodash-es'
import { join, resolve } from 'path'
import { format } from 'prettier'
import { Id, IdInput, createId, encodeId } from '../../common/id.js'
import RegistryLookup from '../../loader/registry/index.js'

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
         import { NormalizedId } from '@pssbletrngle/data-modifier'
         
         declare module '@pssbletrngle/data-modifier/generated' {
            export type RegistryId = NormalizedId
            
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            export type InferIds<T extends RegistryId> = NormalizedId
         
            export type ItemId = NormalizedId
         
            export type BlockId = NormalizedId
         
            export type FluidId = NormalizedId
         
            export type RecipeSerializerId = NormalizedId

            export type EntityTypeId = NormalizedId
         }`,
         { parser: 'typescript' }
      )
   )
}
