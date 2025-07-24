import { MaterialType } from './MaterialType'
import type { TransformedStandard } from './interfaces'
import { BaseModel } from './BaseModel'

export class Standard extends BaseModel {
  public name: string
  public weight: number
  public material_type: MaterialType

  constructor(data: TransformedStandard) {
    super(data)
    this.name = data.name
    this.weight = data.weight
    this.material_type = new MaterialType(data.material_type)
  }

  getDisplayName(): string {
    return this.name
  }

  override getId(): number {
    return this.id
  }

  getName(): string {
    return this.name
  }

  getWeight(): number {
    return this.weight
  }

  getMaterialType(): MaterialType {
    return this.material_type
  }
} 