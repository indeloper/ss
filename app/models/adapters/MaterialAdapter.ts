import { MaterialStandardAdapter } from './MaterialStandardAdapter'
import type { ApiMaterial, TransformedMaterial } from '../interfaces'
import { MaterialStandard } from '../MaterialStandard'

export class MaterialAdapter {
  static transform(apiMaterial: ApiMaterial): TransformedMaterial {
    // Обрабатываем old_material_standard_id из standard
    let old_material_standard_id: number | null = null
    if (apiMaterial.relationships.standard) {
      old_material_standard_id = apiMaterial.relationships.standard.id
    }

    return {
      id: apiMaterial.id,
      uuid: (apiMaterial as any).uuid, // пробрасываем, если есть
      amount: apiMaterial.attributes.amount,
      quantity: apiMaterial.attributes.quantity,
      locked: apiMaterial.attributes.locked,
      lock_reason: apiMaterial.attributes.lock_reason,
      project_object_id: apiMaterial.attributes.project_object_id,
      length_group_name: apiMaterial.attributes.length_group_name,
      length_group_min: apiMaterial.attributes.length_group_min,
      length_group_max: apiMaterial.attributes.length_group_max,
      old_material_standard_id: old_material_standard_id,
      material_standard: apiMaterial.relationships.new_standard 
        ? MaterialStandardAdapter.transform(apiMaterial.relationships.new_standard)
        : null
    }
  }

  static transformMany(apiMaterials: ApiMaterial[]): TransformedMaterial[] {
    return apiMaterials.map(material => this.transform(material))
  }

  static fromStandard(standard: MaterialStandard): TransformedMaterial {
    return {
      id: 0, // или null, если допускается
      uuid: undefined,
      amount: 0,
      quantity: 0,
      locked: false,
      lock_reason: null,
      // project_object_id: ... (если нужно, добавьте параметр)
      length_group_name: '',
      length_group_min: 0,
      length_group_max: 0,
      old_material_standard_id: standard.old_standard_id ?? null,
      material_standard: standard.toTransformed()
    }
  }
} 