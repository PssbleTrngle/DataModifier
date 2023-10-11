export class IllegalShapeError extends Error {
   constructor(message: string, readonly input?: any) {
      super(input ? `${message}: ${JSON.stringify(input)}` : message)
   }
}
