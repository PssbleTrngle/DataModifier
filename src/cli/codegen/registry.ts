import { join, resolve } from 'path'
import RegistryLookup from '../../loader/registry/index.js'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { createId, encodeId, Id, IdInput } from '../../common/id.js'
import { camelCase } from 'lodash-es'
import { format } from 'prettier'

const module = '@pssbletrngle/data-modifier/ids'

function idPath(id: Id) {
   return `${id.path.replaceAll('/', '_')}`
}

function idType(id: Id) {
   const cased = camelCase(id.path.replaceAll('/', ' '))
   return cased.charAt(0).toUpperCase() + cased.substring(1)
}

function idTemplate(type: string, values: string[]) {
   return `
        type ${type}Id = ${values.map(it => `'${it}'`).join(' | ')}
   `
}

function inferRegistryTemplate(keys: IdInput<string>[]) {
   return `
        export type InferIds<T extends RegistryId> = {
            ${keys.map(it => `'${encodeId(it)}': ${idType(createId(it))}Id`).join('\n')}
        }[T]
      `
}

function augmentationTemplate(keys: IdInput<string>[]) {
   return `
        import '${module}'
        
        declare module '${module}' {
            interface IdMap {
                'registry': RegistryId
                ${keys.map(it => `'${encodeId(it)}': ${idType(createId(it))}Id`).join('\n')}        
            }
        }`
}

export function generateRegistryTypes(lookup: RegistryLookup, outputDirectory = '.') {
   const typesDirectory = resolve(outputDirectory, '@types')
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

   const augmentationBlock = augmentationTemplate(lookup.registries())

   const content = format([registryBlock, ...idBlocks, augmentationBlock].join('\n\n'), { parser: 'typescript' })

   writeFileSync(join(typesDirectory, 'generated.d.ts'), content)
}
