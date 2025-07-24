import { BaseCollection } from './BaseCollection'
import { MaterialUnit } from '../MaterialUnit'
import type { TransformedMaterialUnit } from '../interfaces'

export class MaterialUnitCollection extends BaseCollection<MaterialUnit> {
  constructor(units: TransformedMaterialUnit[] = []) {
    super(units.map(data => new MaterialUnit(data)))
  }
} 