import {BaseCollection} from './BaseCollection'
import {MaterialStandard} from '../MaterialStandard'
import type {MaterialStandardData} from '../interfaces'
import {useMaterialStandardCollectionFilter} from '../filters/useMaterialStandardCollectionFilter'
import _ from 'lodash'
import {MaterialProperties} from "~/enumerates/MaterialProperties";

export class MaterialStandardCollection extends BaseCollection<MaterialStandard> {

    constructor(standards: MaterialStandardData[] | MaterialStandardCollection = []) {
        if (standards instanceof MaterialStandardCollection) {
            super(standards)
        } else {
            super(standards.map(standardData => new MaterialStandard(standardData)))
        }
    }

    findByPropertyId(propertyId: number): MaterialStandard | undefined {
        return useMaterialStandardCollectionFilter().findByPropertyId(this, propertyId)
    }

    findByBrandId(brandId: number): MaterialStandard | undefined {
        return useMaterialStandardCollectionFilter().findByBrandId(this, brandId)
    }

    findByTypeId(typeId: number): MaterialStandard | undefined {
        return useMaterialStandardCollectionFilter().findByTypeId(this, typeId)
    }

    filterByPropertyId(propertyId: number): this {
        return useMaterialStandardCollectionFilter().filterByPropertyId(this, propertyId) as this
    }

    filterByDoesntHavePropertyId(propertyId: number): this {
        return this.filterBy(standard => !standard.hasProperty(propertyId))
    }

    filterByBrandId(brandId: number): this {
        return useMaterialStandardCollectionFilter().filterByBrandId(this, brandId) as this
    }

    filterByTypeId(typeId: number): this {
        return useMaterialStandardCollectionFilter().filterByTypeId(this, typeId) as this
    }

    filterJoinedStandards(): this {
        return useMaterialStandardCollectionFilter().filterJoinedStandards(this) as this
    }

    filterNotJoinedStandards(): this {
        return useMaterialStandardCollectionFilter().filterNotJoinedStandards(this) as this
    }

    findJoinedOpposite(id: number): MaterialStandard | undefined {
        return this
            .filterBySameBrands(id)
            .filterByMaterialPropertiesIds([MaterialProperties.JOINED], {strict: true})
            .getFirst()
    }

    findAngleOpposite(pileMaterialId: number, angularMaterialId?: number): MaterialStandard | undefined {

        const pileMaterialStandard = this.findById(pileMaterialId)
        if (!pileMaterialStandard) return undefined


        return this
            .when(pileMaterialId && !angularMaterialId, (standardsCollection) => {
                return standardsCollection
                    .filterBySameBrands(pileMaterialId)
                    .filterByMaterialPropertiesIds([MaterialProperties.ANGULAR], {strict: true})
            })
            .when(pileMaterialId && angularMaterialId, (standardsCollection) => {
                return standardsCollection
                    .filterBySameBrands([pileMaterialId, angularMaterialId])
                    .filterByMaterialPropertiesIds([MaterialProperties.ANGULAR, MaterialProperties.WITH_LOCK], {strict: true})
            })
            .getFirst()
    }

    filterBySameBrands(id: number | number[]): this {

        if (Array.isArray(id)) {
            const targetStandards = this.filterByIds(id)

            if (targetStandards.isEmpty()) {
                return new MaterialStandardCollection([]) as this
            }

            return this.filterBy((standard: MaterialStandard) => {
                return _.isEqual(
                    _.flattenDeep(targetStandards.pluck('material_brands').map(brandCollection => brandCollection.pluck('id'))).sort(),
                    standard.material_brands.pluck('id').sort()
                )
            })
        } else {
            const targetStandard = this.findById(id)
            if (!targetStandard) {
                return new MaterialStandardCollection([]) as this
            }

            return this.filterBy((standard: MaterialStandard) => {
                return _.isEqual(
                    targetStandard.material_brands.pluck('id').sort(),
                    standard.material_brands.pluck('id').sort()
                )
            })
        }


    }

    filterByMaterialBrandIds(
        brandIds: number[],
        params: { strict?: boolean } = {strict: false}
    ): this {
        const {strict} = params;

        return this
            .filterBy((standard) => {
                const materialBrandsIds = standard.material_brands?.pluck('id') || [];
                const intersection = _.intersection(materialBrandsIds, brandIds);
                if (strict) return intersection.length === brandIds.length && materialBrandsIds.length === brandIds.length;
                return intersection.length > 0;
            });
    }

    filterByMaterialPropertiesIds(
        propertiesIds: number[],
        params: { strict?: boolean, allowEmpty?: boolean } = {strict: false, allowEmpty: false}
    ): this {
        const {strict, allowEmpty} = params;

        return this
            .filterBy((standard) => {
                const materialPropertyIds = standard?.material_properties?.pluck('id') || [];
                const intersection = _.intersection(materialPropertyIds, propertiesIds);
                if (allowEmpty && materialPropertyIds.length === 0) return true;
                if (strict) return intersection.length === propertiesIds.length && materialPropertyIds.length === propertiesIds.length;
                return intersection.length > 0;
            });
    }


    filterJoinOpposite(id: number): this {
        return useMaterialStandardCollectionFilter().filterJoinOpposite(this, id) as this
    }

    filterJoinedOpposite(id: number): this {

        const standard = this.findById(id)
        if (!standard) return new MaterialStandardCollection([])

        if (standard.hasProperty(9)) {
            console.log('has property 9')
            return new MaterialStandardCollection([standard])
        } else {
            return this.filterStandardsWithSameBrands(id).filterByPropertyId(9).filterByDoesntHavePropertyId(4)
        }

    }


    filterAlternativerForCuttedMaterialStandard(id: number): this {
        return useMaterialStandardCollectionFilter().filterAlternativerForCuttedMaterialStandard(this, id) as this
    }

    filterStandardsWithSameBrands(standardId: number): MaterialStandardCollection {
        return useMaterialStandardCollectionFilter().filterStandardsWithSameBrands(this, standardId)
    }

    filterStandardsWithSameBrandsAndProperty9(standardId: number): MaterialStandardCollection {
        return useMaterialStandardCollectionFilter().filterStandardsWithSameBrandsAndProperty9(this, standardId)
    }

    groupByBrandSets(): Map<string, MaterialStandard[]> {
        return useMaterialStandardCollectionFilter().groupByBrandSets(this)
    }

    findDuplicateBrandGroups(): MaterialStandard[][] {
        return useMaterialStandardCollectionFilter().findDuplicateBrandGroups(this)
    }

    getUniqueMaterialTypes(): Array<{ key: number, value: string }> {
        const uniqueTypes = new Map<number, string>()

        this.items.forEach(standard => {
            const type = standard.material_type
            if (type && !uniqueTypes.has(type.getId())) {
                uniqueTypes.set(type.getId(), type.getName())
            }
        })

        return Array.from(uniqueTypes.entries()).map(([key, value]) => ({key, value}))
    }

    filterByMaterialTypeIds(typeIds: number[]): this {
        return useMaterialStandardCollectionFilter().filterByMaterialTypeIds(this, typeIds) as this
    }

    getUniqueMaterialBrands(): Array<{ key: number, value: string }> {
        const uniqueBrands = new Map<number, string>()

        this.items.forEach(standard => {
            standard.material_brands.getAll().forEach(brand => {
                if (!uniqueBrands.has(brand.getId())) {
                    uniqueBrands.set(brand.getId(), brand.getName())
                }
            })
        })

        return Array.from(uniqueBrands.entries()).map(([key, value]) => ({key, value}))
    }


    getUniqueMaterialProperties(): Array<{ key: number, value: string }> {
        const uniqueProperties = new Map<number, string>()

        this.items.forEach(standard => {
            standard.material_properties.getAll().forEach(property => {
                if (!uniqueProperties.has(property.getId())) {
                    uniqueProperties.set(property.getId(), property.getName())
                }
            })
        })

        return Array.from(uniqueProperties.entries()).map(([key, value]) => ({key, value}))
    }

    filterByMaterialPropertyIds(propertyIds: number[]): this {
        return useMaterialStandardCollectionFilter().filterByMaterialPropertyIds(this, propertyIds) as this
    }
}