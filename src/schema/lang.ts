import zod from 'zod'

export const LangSchema = zod.record(zod.string(), zod.string())

export type LangDefinition = zod.infer<typeof LangSchema>
