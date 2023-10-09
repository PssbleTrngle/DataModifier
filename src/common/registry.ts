import { createId, encodeId, Id, IdInput, NormalizedId } from './id'

export default class Registry<TEntry, TId extends string = string> {
   private readonly entries = new Map<NormalizedId<TId>, TEntry>

   set(key: IdInput<TId>, value: TEntry) {
      this.entries.set(encodeId(key), value)
   }

   get(key: IdInput<TId>) {
      return this.entries.get(encodeId(key))
   }

   getOrPut(key: IdInput<TId>, defaultValue: () => TEntry) {
      const existing = this.get(key)
      if (existing) return existing

      const created = defaultValue()
      this.set(key, created)
      return created
   }

   forEach(consumer: (value: TEntry, key: Id) => void) {
      this.entries.forEach((value, key) => consumer(value, createId(key)))
   }

   clear() {
      this.entries.clear()
   }

   keys() {
      return  [...this.entries.keys()]
   }

   has(key: IdInput<TId>) {
      return this.entries.has(encodeId(key))
   }
}