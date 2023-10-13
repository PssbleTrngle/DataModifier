import { createId, encodeId, Id, NormalizedId } from '../src/common/id.js'
import Registry from '../src/common/registry.js'
import { resolveIDTest } from '../src/common/predicates.js'

it('parses id from string', () => {
   expect(createId('minecraft:stone')).toMatchObject({ namespace: 'minecraft', path: 'stone' })
   expect(createId('dirt')).toMatchObject({ namespace: 'minecraft', path: 'dirt' })
   expect(createId('minecraft:with/path')).toMatchObject({ namespace: 'minecraft', path: 'with/path' })
   expect(createId('example:custom')).toMatchObject({ namespace: 'example', path: 'custom' })
})

it('parses id from tag', () => {
   expect(createId('#minecraft:planks')).toMatchObject({ namespace: 'minecraft', path: 'planks', isTag: true })
   expect(createId('#logs')).toMatchObject({ namespace: 'minecraft', path: 'logs', isTag: true })
   expect(createId('#minecraft:nested/tag')).toMatchObject({ namespace: 'minecraft', path: 'nested/tag', isTag: true })
})

it('accepts id object', () => {
   const id: Id = { namespace: 'minecraft', path: 'the/id' }
   expect(createId(id)).toMatchObject(id)
})

it('encodes id correctly', () => {
   expect(encodeId('#minecraft:planks')).toBe('#minecraft:planks')
   expect(encodeId('#mineable/axe')).toBe('#minecraft:mineable/axe')
   expect(encodeId('#mineable/axe')).toBe('#minecraft:mineable/axe')
   expect(encodeId({ namespace: 'minecraft', path: 'fire' })).toBe('minecraft:fire')
   expect(encodeId({ namespace: 'minecraft', path: 'pickaxes', isTag: true })).toBe('#minecraft:pickaxes')
})

it('correctly tests id using string', () => {
   const predicate = resolveIDTest<NormalizedId>('minecraft:stone')

   expect(predicate({ namespace: 'minecraft', path: 'stone' })).toBeTruthy()
   expect(predicate('minecraft:stone')).toBeTruthy()

   expect(predicate({ namespace: 'minecraft', path: 'planks' })).toBeFalsy()
   expect(predicate('minecraft:end_stone')).toBeFalsy()
   expect(predicate('example:stone')).toBeFalsy()
})

it('correctly tests id using regex', () => {
   const predicate = resolveIDTest(/.+:oak_.+/)

   expect(predicate({ namespace: 'minecraft', path: 'oak_planks' })).toBeTruthy()
   expect(predicate('minecraft:oak_log')).toBeTruthy()
   expect(predicate('something:oak_quibbels')).toBeTruthy()

   expect(predicate({ namespace: 'example', path: 'spruce_log' })).toBeFalsy()
   expect(predicate('minecraft:stripped_oak_log')).toBeFalsy()
})

it('correctly tests id using predicate', () => {
   const predicate = resolveIDTest(it => it.includes('one'))

   expect(predicate({ namespace: 'minecraft', path: 'stone' })).toBeTruthy()
   expect(predicate('minecraft:bone_block')).toBeTruthy()
   expect(predicate('something:kwoner')).toBeTruthy()
   expect(predicate('one:two')).toBeTruthy()

   expect(predicate({ namespace: 'example', path: 'spruce_log' })).toBeFalsy()
   expect(predicate('minecraft:andesite')).toBeFalsy()
})

it('works as unique map key', () => {
   const map = new Registry<number>()

   map.set({ namespace: 'minecraft', path: 'air' }, 1)
   map.set({ namespace: 'minecraft', path: 'dirt' }, 2)
   map.set({ namespace: 'minecraft', path: 'fire' }, 3)
   map.set({ namespace: 'minecraft', path: 'water' }, 4)
   map.set({ namespace: 'minecraft', path: 'tag', isTag: true }, 5)

   expect(map.get({ namespace: 'minecraft', path: 'air' })).toEqual(1)
   expect(map.get({ namespace: 'minecraft', path: 'dirt' })).toEqual(2)
   expect(map.get({ namespace: 'minecraft', path: 'fire' })).toEqual(3)
   expect(map.get({ namespace: 'minecraft', path: 'water' })).toEqual(4)
   expect(map.get('#minecraft:tag')).toEqual(5)
})
