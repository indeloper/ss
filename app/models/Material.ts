import { MaterialStandard } from './MaterialStandard'
import type { TransformedMaterial } from './interfaces'
import { BaseModel } from './BaseModel'
import _ from 'lodash'
import { MaterialAdapter } from './adapters/MaterialAdapter'
import {v4 as uuidv4} from 'uuid'

export class Material extends BaseModel {
  public amount: number
  public quantity: number
  public initial_amount: number
  public initial_quantity: number
  public locked: boolean
  public lock_reason: string | null
  public project_object_id: number
  public length_group_name: string
  public length_group_min: number
  public length_group_max: number
  public old_material_standard_id: number | null
  public material_standard: MaterialStandard
  public cut_from?: string
  public cut_operation_uuid?: string

  constructor(data: TransformedMaterial) {
    super(data)
    this.amount = data.amount
    this.quantity = data.quantity
    this.initial_amount = data.amount
    this.initial_quantity = data.quantity
    this.locked = data.locked
    this.lock_reason = data.lock_reason
    this.project_object_id = data.project_object_id
    this.length_group_name = data.length_group_name
    this.length_group_min = data.length_group_min
    this.length_group_max = data.length_group_max
    this.old_material_standard_id = data.old_material_standard_id
    this.material_standard = new MaterialStandard(data.material_standard)
  }

  static createFromStandard(standard: MaterialStandard): Material {
    const data = MaterialAdapter.fromStandard(standard)
    return new Material(data)
  }

  get total_weight(): number {
    if (!this.material_standard) return 0;
    const brands = this.material_standard.material_brands.getAll();
    const sumWeight = _.sumBy(brands, (b: any) => Number(b.weight) || 0);
    return parseFloat(Number(this.amount * this.quantity * sumWeight).toFixed(2));
  }

  get initial_total_weight(): number {
    if (!this.material_standard) return 0;
    const brands = this.material_standard.material_brands.getAll();
    const sumWeight = _.sumBy(brands, (b: any) => Number(b.weight) || 0);
    return parseFloat(Number(this.initial_amount * this.initial_quantity * sumWeight).toFixed(2));
  }

  getDisplayName(): string {
    return this.material_standard.getDisplayName()
  }

  override getId(): number {
    return this.id
  }

  getAmount(): number {
    return this.amount
  }

  getQuantity(): number {
    return this.quantity
  }

  getDisplayType(): string {
    return this.material_standard.material_type.name
  }

  getDisplayBrands(): string {
    return this.material_standard.material_brands.getAll().map((brand: any) => brand.name).join(', ')
  }

  getDisplayProperties(): string {
    return this.material_standard.material_properties.getAll().map((prop: any) => prop.name).join(', ')
  }

  getDisplayQuantity(): string {
    return `${parseFloat(Number(this.quantity).toFixed(2))} ${this.material_standard.material_type.material_unit?.label}`
  }

  getDisplayAmount(): string {
    return `${parseFloat(Number(this.amount).toFixed(2))} шт.`
  }

  getDisplayTotalWeight(): string {
    return `${this.total_weight.toFixed(2)} т.`
  }

  getDisplayInitialQuantity(): string {
    return `${parseFloat(Number(this.initial_quantity).toFixed(2))} ${this.material_standard.material_type.material_unit?.label}`
  }

  getDisplayInitialAmount(): string {
    return `${parseFloat(Number(this.initial_amount).toFixed(2))} шт.`
  }

  getDisplayInitialTotalWeight(): string {
    return `${this.initial_total_weight.toFixed(2)} т.`
  }

  isLocked(): boolean {
    return this.locked
  }

  getLockReason(): string | null {
    return this.lock_reason
  }

  getProjectObjectId(): number {
    return this.project_object_id
  }

  getLengthGroupName(): string {
    return this.length_group_name
  }

  getLengthGroupMin(): number {
    return this.length_group_min
  }

  getLengthGroupMax(): number {
    return this.length_group_max
  }

  getOldMaterialStandardId(): number | null {
    return this.old_material_standard_id
  }

  getMaterialStandard(): MaterialStandard | null {
    return this.material_standard
  }

  hasMaterialStandard(): boolean {
    return this.material_standard !== null
  }

  cloneWithNewParams(quantity: number, amount: number, cutOperationUuid?: string, keepOriginal?: boolean): Material {
    const cloned = Object.create(Material.prototype)
    
    cloned.id = this.id
    cloned.uuid = keepOriginal ? this.uuid : uuidv4() // Сохраняем оригинальный UUID для неиспользованной части
    cloned.locked = this.locked
    cloned.lock_reason = this.lock_reason
    cloned.project_object_id = this.project_object_id
    cloned.length_group_name = this.length_group_name
    cloned.length_group_min = this.length_group_min
    cloned.length_group_max = this.length_group_max
    cloned.old_material_standard_id = this.old_material_standard_id

    cloned.amount = amount
    cloned.quantity = quantity
    cloned.initial_amount = keepOriginal ? this.initial_amount : amount
    cloned.initial_quantity = keepOriginal ? this.initial_quantity : quantity
    
    if (keepOriginal) {
      cloned.cut_from = this.cut_from
      cloned.cut_operation_uuid = this.cut_operation_uuid
    } else {
      if (this.cut_from && this.cut_operation_uuid) {
        cloned.cut_from = this.cut_from
        cloned.cut_operation_uuid = this.cut_operation_uuid
      } else {
        cloned.cut_from = this.uuid
        cloned.cut_operation_uuid = cutOperationUuid || uuidv4()
      }
    }
    
    cloned.material_standard = this.material_standard
    
    return cloned
  }

  cloneWithUsedAmounts(): Material {
    const usedQuantity = this.isFixedQuantity ? this.quantity : this.initial_quantity - this.quantity
    const usedAmount = this.initial_amount - this.amount
    
    if (usedQuantity <= 0 && usedAmount <= 0) {
      return this.cloneWithNewParams(0, 0)
    }
    
    const cloned = this.cloneWithNewParams(usedQuantity, usedAmount)
    
    cloned.initial_quantity = usedQuantity
    cloned.initial_amount = usedAmount
    
    return cloned
  }

  get isFixedQuantity(): boolean {
    return this.material_standard.material_type.fixed_quantity === true
  }

  isQuantityChanged(): boolean {
    return this.quantity !== this.initial_quantity
  }

  isAmountChanged(): boolean {
    return this.amount !== this.initial_amount
  }

  isTotalWeightChanged(): boolean {
    return this.total_weight !== this.initial_total_weight
  }

  get isChanged(): boolean {
    return this.quantity !== this.initial_quantity || this.amount !== this.initial_amount
  }

  /**
   * Заменяет материальный стандарт у текущего материала
   * @param materialStandard - новый стандарт материала
   */
  changeMaterialStandard(materialStandard: MaterialStandard): void {
    this.material_standard = materialStandard
    this.old_material_standard_id = this.material_standard.id
  }
}