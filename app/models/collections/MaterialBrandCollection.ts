import { BaseCollection } from './BaseCollection'
import { MaterialBrand } from '../MaterialBrand'
import type { MaterialBrandData } from '../interfaces'

export class MaterialBrandCollection extends BaseCollection<MaterialBrand> {

  constructor(brands: MaterialBrandData[] | MaterialBrandCollection = []) {
    if (brands instanceof MaterialBrandCollection) {
      super(brands)
    } else {
      super(brands.map(brandData => new MaterialBrand(brandData)))
    }
  }
}