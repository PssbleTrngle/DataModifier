import { existsSync, mkdirSync, rmdirSync } from 'fs'

beforeAll(() => {
   if (1 === 1) return
   const emitOutput = 'test-output'
   if (existsSync(emitOutput)) rmdirSync(emitOutput, { recursive: true })
   mkdirSync(emitOutput)
})
