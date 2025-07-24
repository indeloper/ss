export interface TransformationType {
  label: string
  value: number
}

export const TRANSFORMATION_TYPES: TransformationType[] = [
  {
    label: 'Резка по длине',
    value: 1
  },
  {
    label: 'Стыковка по длине',
    value: 2
  }
]

export default TRANSFORMATION_TYPES
