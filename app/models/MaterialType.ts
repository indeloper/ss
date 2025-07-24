import { MaterialUnit } from './MaterialUnit'
import type { TransformedMaterialType, TransformedMaterialUnit } from './interfaces'
import { BaseModel } from './BaseModel'

export class MaterialType extends BaseModel {
  public name: string
  public description: string
  public accounting_type: number
  public unit_id?: number
  public fixed_quantity?: boolean
  public instruction?: string | null
  public material_unit?: MaterialUnit

  constructor(data: TransformedMaterialType) {
    super(data)
    this.name = data.name
    this.description = data.description
    this.accounting_type = data.accounting_type
    this.unit_id = data.unit_id
    this.fixed_quantity = data.fixed_quantity
    this.instruction = data.instruction
    this.material_unit = data.material_unit ? new MaterialUnit(data.material_unit) : undefined
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

  getDescription(): string {
    return this.description
  }

  getAccountingType(): number {
    return this.accounting_type
  }

  getMaterialUnit(): MaterialUnit | undefined {
    return this.material_unit
  }
} 