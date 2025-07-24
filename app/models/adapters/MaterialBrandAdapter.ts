import { MaterialTypeAdapter } from './MaterialTypeAdapter'
import type { ApiMaterialBrand, TransformedMaterialBrand } from '../interfaces'

export class MaterialBrandAdapter {
  static transform(apiMaterialBrand: ApiMaterialBrand): TransformedMaterialBrand {
    return {
      id: apiMaterialBrand.id,
      uuid: (apiMaterialBrand as any).uuid, // пробрасываем, если есть
      name: apiMaterialBrand.attributes.name,
      description: apiMaterialBrand.attributes.description,
      weight: apiMaterialBrand.attributes.weight,
      material_type: MaterialTypeAdapter.transform(apiMaterialBrand.relationships.material_type)
    }
  }

  static transformMany(apiMaterialBrands: ApiMaterialBrand[]): TransformedMaterialBrand[] {
    return apiMaterialBrands.map(brand => this.transform(brand))
  }
} 