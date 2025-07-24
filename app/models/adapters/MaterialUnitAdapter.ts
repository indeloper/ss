import type { ApiMaterialUnit, TransformedMaterialUnit } from '../interfaces'

export class MaterialUnitAdapter {
  static transform(apiMaterialUnit: ApiMaterialUnit): TransformedMaterialUnit {
    return {
      id: apiMaterialUnit.id,
      uuid: (apiMaterialUnit as any).uuid, // пробрасываем, если есть
      label: apiMaterialUnit.attributes.label,
      name: apiMaterialUnit.attributes.name,
      description: apiMaterialUnit.attributes.description
    }
  }

  static transformMany(apiMaterialUnits: ApiMaterialUnit[]): TransformedMaterialUnit[] {
    return apiMaterialUnits.map(unit => this.transform(unit))
  }
} 