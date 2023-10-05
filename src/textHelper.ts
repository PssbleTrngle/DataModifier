import { format } from 'prettier'
import json from 'json5'

export function fromJson(input: string) {
   return json.parse(input)
}

export function toJson(input: unknown) {
   return formatJson(JSON.stringify(input))
}

export function formatJson(input: string) {
   return format(input, { parser: 'json' })
}
