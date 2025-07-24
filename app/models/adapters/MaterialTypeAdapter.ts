import { MaterialUnitAdapter } from './MaterialUnitAdapter'
import type { ApiMaterialType, TransformedMaterialType } from '../interfaces'

export class MaterialTypeAdapter {
  static transform(apiMaterialType: ApiMaterialType): TransformedMaterialType {
    return {
      id: apiMaterialType.id,
      uuid: (apiMaterialType as any).uuid, // пробрасываем, если есть
      name: apiMaterialType.attributes.name,
      description: apiMaterialType.attributes.description,
      accounting_type: apiMaterialType.attributes.accounting_type,
      unit_id: apiMaterialType.attributes.unit_id,
      fixed_quantity: apiMaterialType.attributes.fixed_quantity,
      instruction: apiMaterialType.attributes.instruction,
      material_unit: apiMaterialType.relationships?.material_unit
        ? MaterialUnitAdapter.transform(apiMaterialType.relationships.material_unit)
        : undefined
    }
  }

  static transformMany(apiMaterialTypes: ApiMaterialType[]): TransformedMaterialType[] {
    return apiMaterialTypes.map(type => this.transform(type))
  }
} 