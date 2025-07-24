import { BaseCollection } from './BaseCollection'
import { MaterialProperty } from '../MaterialProperty'
import type { MaterialPropertyData } from '../interfaces'

export class MaterialPropertyCollection extends BaseCollection<MaterialProperty> {

  constructor(properties: MaterialPropertyData[] | MaterialPropertyCollection = []) {
    if (properties instanceof MaterialPropertyCollection) {
      super(properties)
    } else {
      super(properties.map(propertyData => new MaterialProperty(propertyData)))
    }
  }
}