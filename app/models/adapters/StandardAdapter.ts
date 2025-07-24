import { MaterialTypeAdapter } from './MaterialTypeAdapter'
import type { ApiStandard, TransformedStandard } from '../interfaces'

export class StandardAdapter {
  static transform(apiStandard: ApiStandard): TransformedStandard {
    return {
      id: apiStandard.id,
      uuid: (apiStandard as any).uuid, // пробрасываем, если есть
      name: apiStandard.attributes.name,
      weight: apiStandard.attributes.weight,
      material_type: MaterialTypeAdapter.transform(apiStandard.relationships.material_type)
    }
  }

  static transformMany(apiStandards: ApiStandard[]): TransformedStandard[] {
    return apiStandards.map(standard => this.transform(standard))
  }
} 