import type { TransformedMaterialUnit } from './interfaces'
import { BaseModel } from './BaseModel'

export class MaterialUnit extends BaseModel {
  public label: string
  public name: string
  public description: string | null

  constructor(data: TransformedMaterialUnit) {
    super(data)
    this.label = data.label
    this.name = data.name
    this.description = data.description
  }

  getDisplayName(): string {
    return this.name
  }

  override getId(): number {
    return this.id
  }

  getLabel(): string {
    return this.label
  }

  getName(): string {
    return this.name
  }

  getDescription(): string | null {
    return this.description
  }
} 