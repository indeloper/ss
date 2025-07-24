import { MaterialType } from './MaterialType'
import type { TransformedMaterialBrand } from './interfaces'
import { BaseModel } from './BaseModel'

export class MaterialBrand extends BaseModel {
  public name: string
  public description: string | null
  public weight: string
  public material_type: MaterialType

  constructor(data: TransformedMaterialBrand) {
    super(data)
    this.name = data.name
    this.description = data.description
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

  getDescription(): string | null {
    return this.description
  }

  getWeight(): string {
    return this.weight
  }

  getMaterialType(): MaterialType {
    return this.material_type
  }
} 