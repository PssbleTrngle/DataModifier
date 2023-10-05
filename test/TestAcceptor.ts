import { Acceptor } from '@pssbletrngle/pack-resolver'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'

export interface TestAcceptor extends Acceptor {
   at(path: string): string | null

   paths(): string[]

   jsonAt(path: string): string | null
}

export default function createTestAcceptor(emitOutput: string | null = null): TestAcceptor {
   const received = new Map<string, string>()

   const emit: Acceptor = (path, content) => {
      if (!emitOutput) return
      const fullPath = join('test-output', emitOutput, path)
      const dir = dirname(fullPath)
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      writeFileSync(fullPath, content)
   }

   const acceptor: TestAcceptor = (path, content) => {
      received.set(path, content.toString())
      emit(path, content)
      return true
   }

   acceptor.paths = () => [...received.keys()]

   acceptor.at = path => received.get(path) ?? null
   acceptor.jsonAt = path => {
      const raw = acceptor.at(path)
      return raw && JSON.parse(raw)
   }

   return acceptor
}
