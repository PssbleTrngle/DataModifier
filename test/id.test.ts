import { createId, Id } from '../src/common/id'
import { resolveIDTest } from '../src/common/ingredient'

test('parses id from string', () => {
   expect(createId('minecraft:stone')).toMatchObject({ namespace: 'minecraft', path: 'stone' })
   expect(createId('minecraft:with/path')).toMatchObject({ namespace: 'minecraft', path: 'with/path' })
   expect(createId('example:custom')).toMatchObject({ namespace: 'example', path: 'custom' })
})

test('parses id from tag', () => {
   expect(createId('#minecraft:planks')).toMatchObject({ namespace: 'minecraft', path: 'planks' })
   expect(createId('#minecraft:nested/tag')).toMatchObject({ namespace: 'minecraft', path: 'nested/tag' })
})

test('accepts id object', () => {
   const id: Id = { namespace: 'minecraft', path: 'the/id' }
   expect(createId(id)).toMatchObject(id)
})

test('correctly tests id using string', () => {
   const predicate = resolveIDTest<string>('minecraft:stone')

   expect(predicate({ namespace: 'minecraft', path: 'stone' })).toBeTruthy()
   expect(predicate('minecraft:stone')).toBeTruthy()

   expect(predicate({ namespace: 'minecraft', path: 'planks' })).toBeFalsy()
   expect(predicate('minecraft:end_stone')).toBeFalsy()
   expect(predicate('example:stone')).toBeFalsy()
})

test('correctly tests id using regex', () => {
   const predicate = resolveIDTest(/.+:oak_.+/)

   expect(predicate({ namespace: 'minecraft', path: 'oak_planks' })).toBeTruthy()
   expect(predicate('minecraft:oak_log')).toBeTruthy()
   expect(predicate('something:oak_quibbels')).toBeTruthy()

   expect(predicate({ namespace: 'example', path: 'spruce_log' })).toBeFalsy()
   expect(predicate('minecraft:stripped_oak_log')).toBeFalsy()
})

test('correctly tests id using predicate', () => {
   const predicate = resolveIDTest(it => it.includes('one'))

   expect(predicate({ namespace: 'minecraft', path: 'stone' })).toBeTruthy()
   expect(predicate('minecraft:bone_block')).toBeTruthy()
   expect(predicate('something:kwoner')).toBeTruthy()
   expect(predicate('one:two')).toBeTruthy()

   expect(predicate({ namespace: 'example', path: 'spruce_log' })).toBeFalsy()
   expect(predicate('minecraft:andesite')).toBeFalsy()
})
