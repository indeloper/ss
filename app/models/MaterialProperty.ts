import type { TransformedMaterialProperty } from './interfaces'
import { BaseModel } from './BaseModel'

export class MaterialProperty extends BaseModel {
  public name: string
  public description: string | null
  public weight_factor: number

  constructor(data: TransformedMaterialProperty) {
    super(data)
    this.name = data.name
    this.description = data.description
    this.weight_factor = data.weight_factor
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

  getDescription(): string | null {
    return this.description
  }

  getWeightFactor(): number {
    return this.weight_factor
  }
} 