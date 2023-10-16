import { format } from 'prettier'
import json from 'json5'

export function fromJson(input: string) {
   try {
      return json.parse(input)
   } catch (e) {
      if (e instanceof SyntaxError) {
         return json.parse(input.replaceAll('\r\n', ''))
      }
      throw e
   }
}

export function toJson(input: unknown) {
   return formatJson(JSON.stringify(input))
}

export function formatJson(input: string) {
   return format(input, { parser: 'json' })
}
