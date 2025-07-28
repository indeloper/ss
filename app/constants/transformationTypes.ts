export interface TransformationType {
  label: string
  value: number,
  key: string,
  disabled?: boolean
}

export const TRANSFORMATION_TYPES: TransformationType[] = [
  {
    label: 'Резка по длине',
    value: 1,
    key: 'cut'
  },
  {
    label: 'Стыковка по длине',
    value: 2,
    key: 'join'
  },
  {
    label: 'Изготовление углового шпунта',
    value: 3,
    key: 'angle'
  },
  {
    label: 'Изготовление клиновидного шпунта',
    value: 4,
    key: 'wedge'
  },
  {
    label: 'Изготовление закладной детали',
    value: 8,
    key: 'embed'
  },
  {
    label: 'Изготовление опорных столиков',
    value: 9,
    key: 'support'
  },
  {
    label: 'Изготовление стержня МСБ',
    value: 10,
    key: 'kernel',
    disabled: true,
  },
  {
    label: 'Изготовление МСБ',
    value: 11,
    key: 'msb',
    disabled: true,
  },
  {
    label: 'Спаривание двутавровой балки',
    value: 5,
    key: 'beam'
  },
  {
    label: 'Роспуск углового шпунта',
    value: 6,
    key: 'angle-split'
  },
  {
    label: 'Роспуск двутавровой балки',
    value: 7,
    key: 'beam-split'
  },
]

export default TRANSFORMATION_TYPES
