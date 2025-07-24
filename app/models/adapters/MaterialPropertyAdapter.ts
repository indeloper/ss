import type { ApiMaterialProperty, TransformedMaterialProperty } from '../interfaces'

export class MaterialPropertyAdapter {
  static transform(apiMaterialProperty: ApiMaterialProperty): TransformedMaterialProperty {
    return {
      id: apiMaterialProperty.id,
      name: apiMaterialProperty.attributes.name,
      description: apiMaterialProperty.attributes.description,
      weight_factor: apiMaterialProperty.attributes.weight_factor
    }
  }

  static transformMany(apiMaterialProperties: ApiMaterialProperty[]): TransformedMaterialProperty[] {
    return apiMaterialProperties.map(property => this.transform(property))
  }
} 