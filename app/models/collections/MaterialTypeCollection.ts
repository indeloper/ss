import { BaseCollection } from './BaseCollection'
import { MaterialType } from '../MaterialType'
import type { TransformedMaterialType } from '../interfaces'

export class MaterialTypeCollection extends BaseCollection<MaterialType> {
  constructor(types: TransformedMaterialType[] = []) {
    super(types.map(data => new MaterialType(data)))
  }
} 