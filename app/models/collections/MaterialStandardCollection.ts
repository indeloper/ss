import { BaseCollection } from './BaseCollection'
import { MaterialStandard } from '../MaterialStandard'
import type { MaterialStandardData } from '../interfaces'
import _ from 'lodash'

export class MaterialStandardCollection extends BaseCollection<MaterialStandard> {

  constructor(standards: MaterialStandardData[] | MaterialStandardCollection = []) {
    if (standards instanceof MaterialStandardCollection) {
      super(standards)
    } else {
      super(standards.map(standardData => new MaterialStandard(standardData)))
    }
    
  }

  findByPropertyId(propertyId: number): MaterialStandard | undefined {
    return this.findBy(standard => 
      standard.material_properties.getAll().some(prop => prop.getId() === propertyId)
    )
  }

  findByBrandId(brandId: number): MaterialStandard | undefined {
    return this.findBy(standard => 
      standard.material_brands.getAll().some(brand => brand.getId() === brandId)
    )
  }

  findByTypeId(typeId: number): MaterialStandard | undefined {
    return this.findWhere('material_type.id', typeId)
  }

  filterByPropertyId(propertyId: number): this {
    return this.filterBy(standard => 
      standard.material_properties.getAll().some(prop => prop.getId() === propertyId)
    )
  }

  filterByBrandId(brandId: number): this {
    return this.filterBy(standard => 
      standard.material_brands.getAll().some(brand => brand.getId() === brandId)
    )
  }

  filterByTypeId(typeId: number): this {
    return this.filterWhere('material_type.id', typeId)
  }

  filterJoinedStandards(): this {
    return this.filterBy(standard => standard.isJoined)
  }

  filterNotJoinedStandards(): this {
    return this.filterBy(standard => !standard.isJoined)
  }

  filterJoinOpposite(id: number): this {
    const extractBrandIds = (std: MaterialStandard) => 
      std.material_brands.getAll().map(brand => brand.getId())

    const extractPropertiesExcluding9 = (std: MaterialStandard) => 
      std.material_properties.getAll()
        .filter(prop => prop.getId() !== 9)
        .map(prop => prop.getId())

    return this.findOppositeByBooleanProperty(
      id,
      [extractBrandIds, extractPropertiesExcluding9],
      (standard) => standard.isJoined
    )
  }

  filterStandardsWithSameBrands(standardId: number): MaterialStandardCollection {
    const targetStandard = this.findById(standardId)
    if (!targetStandard) return new MaterialStandardCollection([])

    const targetBrandIds = targetStandard.material_brands
      .getAll()
      .map(brand => brand.getId())
      .sort((a, b) => a - b)
    
    if (targetBrandIds.length === 0) return new MaterialStandardCollection([])

    const targetBrandKey = targetBrandIds.join(',')
    const brandGroupsMap = new Map<string, MaterialStandard[]>()

    for (const standard of this.items) {
      if (standard.getId() === standardId) continue

      const currentBrandIds = standard.material_brands
        .getAll()
        .map(brand => brand.getId())
        .sort((a, b) => a - b)

      const currentBrandKey = currentBrandIds.join(',')

      if (!brandGroupsMap.has(currentBrandKey)) {
        brandGroupsMap.set(currentBrandKey, [])
      }
      brandGroupsMap.get(currentBrandKey)!.push(standard)
    }

    const matchingStandards = brandGroupsMap.get(targetBrandKey) || []
    return new MaterialStandardCollection(matchingStandards)
  }

  groupByBrandSets(): Map<string, MaterialStandard[]> {
    const brandGroupsMap = new Map<string, MaterialStandard[]>()

    for (const standard of this.items) {
      const brandIds = standard.material_brands
        .getAll()
        .map(brand => brand.getId())
        .sort((a, b) => a - b)

      const brandKey = brandIds.join(',')

      if (!brandGroupsMap.has(brandKey)) {
        brandGroupsMap.set(brandKey, [])
      }
      brandGroupsMap.get(brandKey)!.push(standard)
    }

    return brandGroupsMap
  }

  findDuplicateBrandGroups(): MaterialStandard[][] {
    const groups = this.groupByBrandSets()
    return Array.from(groups.values()).filter(group => group.length > 1)
  }
}