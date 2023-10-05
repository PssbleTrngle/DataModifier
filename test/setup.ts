import { existsSync, mkdirSync, rmdirSync } from 'fs'

beforeAll(() => {
   const emitOutput = 'test-output'
   if (existsSync(emitOutput)) rmdirSync(emitOutput, { recursive: true })
   mkdirSync(emitOutput)
})
