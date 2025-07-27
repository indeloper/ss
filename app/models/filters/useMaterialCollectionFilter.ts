import { MaterialCollection } from '../collections/MaterialCollection'
import { Material } from '../Material'
import { MaterialTypes } from '~/enumerates/MaterialTypes'
import { useCollectionFilter } from './useCollectionFilter'

export const useMaterialCollectionFilter = () => {
    const collectionFilter = useCollectionFilter<Material>()

    const filterMaterialsAvailableForJoinTransformation = (materials: MaterialCollection): MaterialCollection => {
        const filteredByMaterialType = filterByMaterialType(materials, [
            MaterialTypes.PILE,
            MaterialTypes.I_BEAM,
            MaterialTypes.STRAIGHT_SEAM_PIPE
        ])

        return filterMaterialWithMaterialProperties(filteredByMaterialType, [9], { allowEmptyProperties: true })
    }

    const filterMaterialsAvailableForCutTransformation = (materials: MaterialCollection): MaterialCollection => {
        const filteredByMaterialType = filterByMaterialType(materials, [
            MaterialTypes.PILE,
            MaterialTypes.ANGULAR_ELEMENT,
            MaterialTypes.SQUARE_PIPE
        ])

        return filteredByMaterialType
    }

    const filterByMaterialType = (materials: MaterialCollection, materialTypeId: number | number[]): MaterialCollection => {
        return collectionFilter.filterByIds(materials, materialTypeId, (material) => 
            material.material_standard?.material_type?.id
        )
    }

    const filterMaterialWithMaterialProperties = (
        materials: MaterialCollection, 
        materialPropertyId: number | number[], 
        options: { allowEmptyProperties?: boolean } = { allowEmptyProperties: false }
    ): MaterialCollection => {
        const propertyIds = collectionFilter.normalizeToArray(materialPropertyId)
        
        return collectionFilter.filterByProperty(materials, (material: Material) => {
            const properties = material.material_standard?.material_properties
            
            if (!properties) {
                return options.allowEmptyProperties
            }

            const propertiesArray = properties.getAll()
            
            if (propertiesArray.length === 0) {
                return options.allowEmptyProperties
            }

            if (propertyIds.length === 0) {
                return options.allowEmptyProperties
            }

            const hasAllRequiredProperties = propertyIds.every(propertyId =>
                propertiesArray.some(property => property.getId() === propertyId)
            )

            return hasAllRequiredProperties || (options.allowEmptyProperties && propertiesArray.length === 0)
        })
    }

    const filterByProjectObject = (materials: MaterialCollection, projectObjectId: number): MaterialCollection => {
        return collectionFilter.filterByProperty(materials, (material: Material) => 
            material.getProjectObjectId() === projectObjectId
        )
    }

    const filterByMaterialStandard = (materials: MaterialCollection, materialStandardId: number): MaterialCollection => {
        return collectionFilter.filterByIds(materials, materialStandardId, (material) => 
            material.getMaterialStandard()?.getId()
        )
    }

    const filterAllByCutFrom = (materials: MaterialCollection, uuid: string): MaterialCollection => {
        return collectionFilter.filterByProperty(materials, (material: Material) => 
            material.cut_from === uuid
        )
    }

    const filterCutFormMaterial = (materials: MaterialCollection, material: Material): MaterialCollection => {
        return filterAllByCutFrom(materials, material.getUuid())
    }

    const filterChanged = (materials: MaterialCollection): MaterialCollection => {
        return collectionFilter.filterByBooleanProperty(materials, (material: Material) => 
            material.isChanged, true
        )
    }

    const filterByMaterialTypeIds = (materials: MaterialCollection, typeIds: number[]): MaterialCollection => {
        return collectionFilter.filterByIds(materials, typeIds, (material) => 
            material.material_standard?.material_type?.getId()
        )
    }

    const filterByMaterialBrandIds = (materials: MaterialCollection, brandIds: number[]): MaterialCollection => {
        return collectionFilter.filterByCollectionIds(materials, brandIds, (material) => 
            material.material_standard?.material_brands
        )
    }

    const filterByEveryMaterialBrandIds = (materials: MaterialCollection, brandIds: number[]): MaterialCollection => {
        return collectionFilter.filterByEveryCollectionIds(materials, brandIds, (material) =>
            material.material_standard?.material_brands
        )
    }

    const filterByMaterialPropertyIds = (materials: MaterialCollection, propertyIds: number[]): MaterialCollection => {
        return collectionFilter.filterByCollectionIds(materials, propertyIds, (material) => 
            material.material_standard?.material_properties
        )
    }

    const findCompatibleMaterials = (materials: MaterialCollection, targetMaterial: Material): MaterialCollection => {
        if (!targetMaterial.material_standard?.material_type) {
            return MaterialCollection.fromMaterials([])
        }
        
        const targetTypeId = targetMaterial.material_standard.material_type.getId()
        
        return collectionFilter.filterByProperty(materials, (material: Material) => {
            if (material.getUuid() === targetMaterial.getUuid()) {
                return false
            }
            
            if (!material.material_standard?.material_type) {
                return false
            }
            
            if (material.material_standard.material_type.getId() !== targetTypeId) {
                return false
            }
            
            return hasSameBrandSet(targetMaterial, material)
        })
    }

    const hasSameBrandSet = (material1: Material, material2: Material): boolean => {
        const brands1 = material1.material_standard?.material_brands?.getAll() || []
        const brands2 = material2.material_standard?.material_brands?.getAll() || []
        
        const brandIds1 = brands1
            .map(brand => brand.getId())
            .sort((a, b) => a - b)
        
        const brandIds2 = brands2
            .map(brand => brand.getId())
            .sort((a, b) => a - b)
        
        if (brandIds1.length !== brandIds2.length) {
            return false
        }
        
        return brandIds1.every((id, index) => id === brandIds2[index])
    }

    return {
        filterMaterialsAvailableForJoinTransformation,
        filterMaterialsAvailableForCutTransformation,
        filterMaterialWithMaterialType: filterByMaterialType,
        filterMaterialWithMaterialProperties,
        filterByProjectObject,
        filterByMaterialStandard,
        filterAllByCutFrom,
        filterCutFormMaterial,
        filterChanged,
        filterByMaterialTypeIds,
        filterByMaterialBrandIds,
        filterByEveryMaterialBrandIds,
        filterByMaterialPropertyIds,
        findCompatibleMaterials,
        hasSameBrandSet
    }
}