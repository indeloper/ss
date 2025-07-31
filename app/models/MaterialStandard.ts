import { MaterialType } from './MaterialType'
import { MaterialBrandCollection } from './collections/MaterialBrandCollection'
import { MaterialPropertyCollection } from './collections/MaterialPropertyCollection'
import { MaterialStandardCollection } from './collections/MaterialStandardCollection'
import type { TransformedMaterialStandard } from './interfaces'
import { BaseModel } from './BaseModel'

export class MaterialStandard extends BaseModel {
  public name: string
  public description: string
  public old_standard_id: number
  public material_type: MaterialType
  public material_brands: MaterialBrandCollection
  public material_properties: MaterialPropertyCollection
  public alternative_standards?: MaterialStandardCollection

  constructor(data: TransformedMaterialStandard) {
    super(data)
    this.name = data.name
    this.description = data.description
    this.old_standard_id = data.old_standard_id
    this.material_type = new MaterialType(data.material_type)
    this.material_brands = new MaterialBrandCollection(data.material_brands)
    this.material_properties = new MaterialPropertyCollection(data.material_properties)
    this.alternative_standards = data.alternative_standards 
      ? new MaterialStandardCollection(data.alternative_standards)
      : undefined
  }

  getDisplayName(): string {
    let name = `${this.material_type.name} ${this.material_brands.getAll().map((brand: any) => brand.name).join(', ')}`

    if (this.material_properties?.getAll().length > 0) {
      name += ` (${this.material_properties.getAll().map((prop: any) => prop.name).join(', ')})`
    }

    return name
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

  getOldStandardId(): number {
    return this.old_standard_id
  }

  getMaterialType(): MaterialType {
    return this.material_type
  }

  getMaterialBrands(): MaterialBrandCollection {
    return this.material_brands
  }

  getMaterialProperties(): MaterialPropertyCollection {
    return this.material_properties
  }

  getTotalWeight(amount: number, quantity: number): number {
    const brands = this.material_brands.getAll()
    const sumWeight = brands.reduce((sum, brand: any) => sum + (Number(brand.weight) || 0), 0)
    return parseFloat(Number(amount * quantity * sumWeight).toFixed(2))
  }

  toTransformed(): TransformedMaterialStandard {
    return {
      id: this.id,
      uuid: this.uuid,
      name: this.name,
      description: this.description,
      old_standard_id: this.old_standard_id,
      material_type: this.material_type, // если нужно, можно добавить .toTransformed()
      material_brands: this.material_brands.getAll(),
      material_properties: this.material_properties.getAll(),
      alternative_standards: this.alternative_standards?.getAll(),
    }
  }

  get isJoined(): boolean {
    return this.hasProperty(9)
  }

  hasProperty(propertyId: number): boolean {
    return this.material_properties.getAll().some(prop => prop.getId() === propertyId)
  }

  hasBrand(brandId: number): boolean {
    return this.material_brands.getAll().some(brand => brand.getId() === brandId)
  }

  has(predicate: (standard: MaterialStandard) => boolean): boolean {
    return predicate(this)
  }
}