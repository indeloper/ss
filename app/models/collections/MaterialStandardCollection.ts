import { BaseCollection } from './BaseCollection'
import { MaterialStandard } from '../MaterialStandard'
import type { MaterialStandardData } from '../interfaces'
import { useMaterialStandardCollectionFilter } from '../filters/useMaterialStandardCollectionFilter'
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

    filterJoinOpposite(id: number): this {
        return useMaterialStandardCollectionFilter().filterJoinOpposite(this, id) as this
    }

    filterStandardsWithSameBrands(standardId: number): MaterialStandardCollection {
        return useMaterialStandardCollectionFilter().filterStandardsWithSameBrands(this, standardId)
    }

    /**
     * Находит стандарты с таким же набором брендов, но обязательно со свойством ID 9
     * @param standardId - ID исходного стандарта
     * @returns коллекция стандартов с теми же брендами и свойством ID 9
     */
    filterStandardsWithSameBrandsAndProperty9(standardId: number): MaterialStandardCollection {
        return useMaterialStandardCollectionFilter().filterStandardsWithSameBrandsAndProperty9(this, standardId)
    }

    groupByBrandSets(): Map<string, MaterialStandard[]> {
        return useMaterialStandardCollectionFilter().groupByBrandSets(this)
    }

    findDuplicateBrandGroups(): MaterialStandard[][] {
        return useMaterialStandardCollectionFilter().findDuplicateBrandGroups(this)
    }

    /**
     * Получает все уникальные типы материалов из коллекции в формате key-value
     * @returns {Array<{key: number, value: string}>} Массив объектов с ID и названиями типов
     */
    getUniqueMaterialTypes(): Array<{ key: number, value: string }> {
        const uniqueTypes = new Map<number, string>()

        this.items.forEach(standard => {
            const type = standard.material_type
            if (type && !uniqueTypes.has(type.getId())) {
                uniqueTypes.set(type.getId(), type.getName())
            }
        })

        return Array.from(uniqueTypes.entries()).map(([key, value]) => ({ key, value }))
    }

    /**
     * Фильтрует стандарты по массиву ID типов материалов
     * @param typeIds - массив ID типов материалов
     * @returns новая коллекция с отфильтрованными стандартами
     */
    filterByMaterialTypeIds(typeIds: number[]): this {
        return useMaterialStandardCollectionFilter().filterByMaterialTypeIds(this, typeIds) as this
    }

    /**
     * Получает все уникальные марки материалов из коллекции в формате key-value
     * @returns {Array<{key: number, value: string}>} Массив объектов с ID и названиями марок
     */
    getUniqueMaterialBrands(): Array<{ key: number, value: string }> {
        const uniqueBrands = new Map<number, string>()

        this.items.forEach(standard => {
            standard.material_brands.getAll().forEach(brand => {
                if (!uniqueBrands.has(brand.getId())) {
                    uniqueBrands.set(brand.getId(), brand.getName())
                }
            })
        })

        return Array.from(uniqueBrands.entries()).map(([key, value]) => ({ key, value }))
    }

    /**
     * Фильтрует стандарты по массиву ID марок материалов
     * @param brandIds - массив ID марок материалов
     * @returns новая коллекция с отфильтрованными стандартами
     */
    filterByMaterialBrandIds(brandIds: number[]): this {
        return useMaterialStandardCollectionFilter().filterByMaterialBrandIds(this, brandIds) as this
    }

    /**
     * Получает все уникальные свойства материалов из коллекции в формате key-value
     * @returns {Array<{key: number, value: string}>} Массив объектов с ID и названиями свойств
     */
    getUniqueMaterialProperties(): Array<{ key: number, value: string }> {
        const uniqueProperties = new Map<number, string>()

        this.items.forEach(standard => {
            standard.material_properties.getAll().forEach(property => {
                if (!uniqueProperties.has(property.getId())) {
                    uniqueProperties.set(property.getId(), property.getName())
                }
            })
        })

        return Array.from(uniqueProperties.entries()).map(([key, value]) => ({ key, value }))
    }

    /**
     * Фильтрует стандарты по массиву ID свойств материалов
     * @param propertyIds - массив ID свойств материалов
     * @returns новая коллекция с отфильтрованными стандартами
     */
    filterByMaterialPropertyIds(propertyIds: number[]): this {
        return useMaterialStandardCollectionFilter().filterByMaterialPropertyIds(this, propertyIds) as this
    }
}