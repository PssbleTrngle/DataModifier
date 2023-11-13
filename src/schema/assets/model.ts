type Facing = 'up' | 'down' | 'north' | 'south' | 'west' | 'east'
type Axis = 'x' | 'y' | 'z'

type Vec3 = [number, number, number]
type Vec4 = [number, number, number, number]

type Element = Readonly<{
   from: Vec3
   to: Vec3
   faces: Record<
      Facing,
      {
         texture: string
         uv?: Vec4
         cullface?: Facing
      }
   >
   rotation?: { origin: Vec3; axis: Axis; angle: number; rescale?: boolean }
   shade?: boolean
}>

export type Model = Readonly<{
   parent?: string
   textures?: Record<string, string>
   elements?: Element[]
   ambientocclusion?: boolean
}>
