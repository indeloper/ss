import { MaterialStandardCollection } from '../collections/MaterialStandardCollection'
import { MaterialStandard } from '../MaterialStandard'
import { useCollectionFilter } from './useCollectionFilter'

export const useMaterialStandardCollectionFilter = () => {
    const collectionFilter = useCollectionFilter<MaterialStandard>()

    const findByPropertyId = (standards: MaterialStandardCollection, propertyId: number): MaterialStandard | undefined => {
        return standards.findBy(standard => 
            standard.material_properties.getAll().some(prop => prop.getId() === propertyId)
        )
    }

    const findByBrandId = (standards: MaterialStandardCollection, brandId: number): MaterialStandard | undefined => {
        return standards.findBy(standard => 
            standard.material_brands.getAll().some(brand => brand.getId() === brandId)
        )
    }

    const findByTypeId = (standards: MaterialStandardCollection, typeId: number): MaterialStandard | undefined => {
        return standards.findWhere('material_type.id', typeId)
    }

    const filterByPropertyId = (standards: MaterialStandardCollection, propertyId: number): MaterialStandardCollection => {
        return collectionFilter.filterByProperty(standards, (standard: MaterialStandard) => 
            standard.material_properties.getAll().some(prop => prop.getId() === propertyId)
        )
    }

    const filterByBrandId = (standards: MaterialStandardCollection, brandId: number): MaterialStandardCollection => {
        return collectionFilter.filterByProperty(standards, (standard: MaterialStandard) => 
            standard.material_brands.getAll().some(brand => brand.getId() === brandId)
        )
    }

    const filterByTypeId = (standards: MaterialStandardCollection, typeId: number): MaterialStandardCollection => {
        return standards.filterWhere('material_type.id', typeId)
    }

    const filterJoinedStandards = (standards: MaterialStandardCollection): MaterialStandardCollection => {
        return collectionFilter.filterByBooleanProperty(standards, (standard: MaterialStandard) => 
            standard.isJoined, true
        )
    }

    const filterNotJoinedStandards = (standards: MaterialStandardCollection): MaterialStandardCollection => {
        return collectionFilter.filterByBooleanProperty(standards, (standard: MaterialStandard) => 
            standard.isJoined, false
        )
    }

    const filterJoinOpposite = (standards: MaterialStandardCollection, id: number): MaterialStandardCollection => {
        const extractBrandIds = (std: MaterialStandard) => 
            std.material_brands.getAll().map(brand => brand.getId())

        const extractPropertiesExcluding9 = (std: MaterialStandard) => 
            std.material_properties.getAll()
                .filter(prop => prop.getId() !== 9)
                .map(prop => prop.getId())

        return standards.findOppositeByBooleanProperty(
            id,
            [extractBrandIds, extractPropertiesExcluding9],
            (standard) => standard.isJoined
        )
    }

    const filterAlternativerForCuttedMaterialStandard = (standards: MaterialStandardCollection, id: number): MaterialStandardCollection => {
        // Находит стыкованный стандарт для разрезанного материала
        return filterJoinOpposite(standards, id)
    }

    const filterStandardsWithSameBrands = (standards: MaterialStandardCollection, standardId: number): MaterialStandardCollection => {
        const targetStandard = standards.findById(standardId)
        if (!targetStandard) return new MaterialStandardCollection([])

        const targetBrandIds = targetStandard.material_brands
            .getAll()
            .map(brand => brand.getId())
            .sort((a, b) => a - b)
        
        if (targetBrandIds.length === 0) return new MaterialStandardCollection([])

        const targetBrandKey = targetBrandIds.join(',')
        const brandGroupsMap = new Map<string, MaterialStandard[]>()

        for (const standard of standards.getAll()) {
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

    const filterStandardsWithSameBrandsAndProperty9 = (standards: MaterialStandardCollection, standardId: number): MaterialStandardCollection => {
        const targetStandard = standards.findById(standardId)
        if (!targetStandard) return new MaterialStandardCollection([])

        const targetBrandIds = targetStandard.material_brands
            .getAll()
            .map(brand => brand.getId())
            .sort((a, b) => a - b)
        
        if (targetBrandIds.length === 0) return new MaterialStandardCollection([])

        const targetBrandKey = targetBrandIds.join(',')
        
        return collectionFilter.filterByProperty(standards, (standard: MaterialStandard) => {
            // Исключаем сам исходный стандарт
            if (standard.getId() === standardId) return false
            
            // Проверяем наличие свойства с ID 9
            const hasProperty9 = standard.material_properties
                .getAll()
                .some(prop => prop.getId() === 9)
            
            if (!hasProperty9) return false
            
            // Проверяем отсутствие свойства с ID 4
            const hasProperty4 = standard.material_properties
                .getAll()
                .some(prop => prop.getId() === 4)
            
            if (hasProperty4) return false
            
            // Проверяем совпадение набора брендов
            const currentBrandIds = standard.material_brands
                .getAll()
                .map(brand => brand.getId())
                .sort((a, b) => a - b)

            const currentBrandKey = currentBrandIds.join(',')
            
            return currentBrandKey === targetBrandKey
        })
    }

    const filterByMaterialTypeIds = (standards: MaterialStandardCollection, typeIds: number[]): MaterialStandardCollection => {
        return collectionFilter.filterByIds(standards, typeIds, (standard) => 
            standard.material_type?.getId()
        )
    }

    const filterByMaterialBrandIds = (standards: MaterialStandardCollection, brandIds: number[]): MaterialStandardCollection => {
        return collectionFilter.filterByCollectionIds(standards, brandIds, (standard) => 
            standard.material_brands
        )
    }

    const filterByMaterialPropertyIds = (standards: MaterialStandardCollection, propertyIds: number[]): MaterialStandardCollection => {
        return collectionFilter.filterByCollectionIds(standards, propertyIds, (standard) => 
            standard.material_properties
        )
    }

    const groupByBrandSets = (standards: MaterialStandardCollection): Map<string, MaterialStandard[]> => {
        const brandGroupsMap = new Map<string, MaterialStandard[]>()

        for (const standard of standards.getAll()) {
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

    const findDuplicateBrandGroups = (standards: MaterialStandardCollection): MaterialStandard[][] => {
        const groups = groupByBrandSets(standards)
        return Array.from(groups.values()).filter(group => group.length > 1)
    }

    return {
        findByPropertyId,
        findByBrandId,
        findByTypeId,
        filterByPropertyId,
        filterByBrandId,
        filterByTypeId,
        filterJoinedStandards,
        filterNotJoinedStandards,
        filterJoinOpposite,
        filterStandardsWithSameBrands,
        filterStandardsWithSameBrandsAndProperty9,
        filterByMaterialTypeIds,
        filterByMaterialBrandIds,
        filterByMaterialPropertyIds,
        groupByBrandSets,
        findDuplicateBrandGroups
    }
}
