import { MaterialTypeAdapter } from './MaterialTypeAdapter'
import { MaterialBrandAdapter } from './MaterialBrandAdapter'
import { MaterialPropertyAdapter } from './MaterialPropertyAdapter'
import type { ApiMaterialStandard, TransformedMaterialStandard } from '../interfaces'

export class MaterialStandardAdapter {
  static transform(apiMaterialStandard: ApiMaterialStandard): TransformedMaterialStandard {
    return {
      id: apiMaterialStandard.id,
      name: apiMaterialStandard.attributes.name,
      description: apiMaterialStandard.attributes.description,
      old_standard_id: apiMaterialStandard.attributes.old_standard_id,
      material_type: MaterialTypeAdapter.transform(apiMaterialStandard.relationships.material_type),
      material_brands: MaterialBrandAdapter.transformMany(apiMaterialStandard.relationships.material_brands),
      material_properties: MaterialPropertyAdapter.transformMany(apiMaterialStandard.relationships.properties),
      alternative_standards: apiMaterialStandard.relationships.alternative_standards
        ? this.transformMany(apiMaterialStandard.relationships.alternative_standards)
        : undefined
    }
  }

  static transformMany(apiMaterialStandards: ApiMaterialStandard[]): TransformedMaterialStandard[] {
    return apiMaterialStandards.map(standard => this.transform(standard))
  }
}