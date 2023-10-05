import { IResolver } from '@pssbletrngle/pack-resolver'

export default interface Loader {
   loadFrom(resolver: IResolver): Promise<void>
}
