import {BaseCollection} from './BaseCollection'
import {Material} from '../Material'
import type {TransformedMaterial} from '../interfaces'
import type {MaterialStandard} from "~/models/MaterialStandard";
import {MaterialTypes} from '~/enumerates/MaterialTypes'
import {useMaterialCollectionFilter} from "~/models/filters/useMaterialCollectionFilter";

export class MaterialCollection extends BaseCollection<Material> {

    constructor(materials: TransformedMaterial[] | Material[] | MaterialCollection = []) {
        if (materials instanceof MaterialCollection) {
            super(materials)
        } else if (Array.isArray(materials) && materials.length > 0 && materials[0] instanceof Material) {
            super(materials as Material[])
        } else if (Array.isArray(materials)) {
            super((materials as TransformedMaterial[]).map(materialData => new Material(materialData)))
        } else {
            super([])
        }
    }

    /**
     * Создает коллекцию из готовых объектов Material
     */
    static fromMaterials(materials: Material[]): MaterialCollection {
        const collection = new MaterialCollection([])
        collection.items = materials
        return collection
    }

    getLockedMaterials(): Material[] {
        return this.items.filter(material => material.isLocked())
    }

    getUnlockedMaterials(): Material[] {
        return this.items.filter(material => !material.isLocked())
    }

    filterByProjectObject(projectObjectId: number): MaterialCollection {
        return useMaterialCollectionFilter().filterByProjectObject(this, projectObjectId)
    }

    filterByMaterialStandard(materialStandardId: number): MaterialCollection {
        return useMaterialCollectionFilter().filterByMaterialStandard(this, materialStandardId)
    }

    filterAllByCutFrom(uuid: string): MaterialCollection {
        return useMaterialCollectionFilter().filterAllByCutFrom(this, uuid)
    }

    filterCutFormMaterial(material: Material): MaterialCollection {
        return useMaterialCollectionFilter().filterCutFormMaterial(this, material)
    }

    filterChanged(): MaterialCollection {
        return useMaterialCollectionFilter().filterChanged(this)
    }

    updateById(id: number, updater: (material: Material) => void): boolean {
        const material = this.items.find(m => m.getId() === id)
        if (material) {
            updater(material)
            return true
        }
        return false
    }

    updateByUuid(uuid: string, updater: (material: Material) => void): boolean {
        const material = this.items.find(m => m.getUuid() === uuid)
        if (material) {
            updater(material)
            return true
        }
        return false
    }

    removeById(id: number): boolean {
        const idx = this.items.findIndex(m => m.getId() === id)
        if (idx !== -1) {
            this.items.splice(idx, 1)
            return true
        }
        return false
    }

    removeByUuid(uuid: string): boolean {
        const idx = this.items.findIndex(m => m.getUuid() === uuid)
        if (idx !== -1) {
            this.items.splice(idx, 1)
            return true
        }
        return false
    }

    /**
     * Заменяет материал с указанным UUID новым материалом на том же месте
     * @param uuid - UUID материала для замены
     * @param newMaterial - новый материал
     * @returns true если замена прошла успешно, false если материал не найден
     */
    replaceByUuid(uuid: string, newMaterial: Material): boolean {
        const idx = this.items.findIndex(m => m.getUuid() === uuid)
        if (idx !== -1) {
            this.items[idx] = newMaterial
            return true
        }
        return false
    }

    allHavePositiveQuantityAndAmount(): boolean {
        return this.items.every(m => m.quantity > 0 && m.amount > 0)
    }

    getTotalWeight(): number {
        return parseFloat(Number(this.items.reduce((sum, material) => sum + (material.total_weight ?? 0), 0)).toFixed(2))
    }

    getTotalAmount(): number {
        return this.items.reduce((sum, material) => sum + (material.amount ?? 0), 0)
    }

    getTotalAmountQuantity(): number {
        return this.items.reduce((sum, material) => sum + ((material.quantity ?? 0) * (material.amount ?? 0)), 0)
    }

    getGroupedAmountQuantityByUnit(): { unit: string, total: number }[] {
        const groups: Record<string, number> = {};
        for (const material of this.items) {
            const unit = material.material_standard?.material_type?.material_unit?.getLabel?.() || material.material_standard?.material_type?.material_unit?.getName?.() || '—';
            const value = (material.quantity ?? 0) * (material.amount ?? 0);
            if (groups[unit]) {
                groups[unit] += value;
            } else {
                groups[unit] = value;
            }
        }
        return Object.entries(groups).map(([unit, total]) => ({unit, total}));
    }

    getGroupedAmountQuantityByType(): { type: string, unit: string, total: number }[] {
        const groups: Record<string, { unit: string, total: number }> = {};
        for (const material of this.items) {
            const type = material.material_standard?.material_type?.getName?.() || '—';
            const unit = material.material_standard?.material_type?.material_unit?.getLabel?.() || material.material_standard?.material_type?.material_unit?.getName?.() || '—';
            const value = (material.quantity ?? 0) * (material.amount ?? 0);
            if (groups[type]) {
                groups[type].total += value;
            } else {
                groups[type] = {unit, total: value};
            }
        }
        return Object.entries(groups).map(([type, {unit, total}]) => ({type, unit, total}));
    }

    createAndAddFromStandard(materialStandard: MaterialStandard): void {
        this.add(Material.createFromStandard(materialStandard))
    }

    createAndAdd(data: TransformedMaterial): Material {
        const material = new Material(data)
        this.add(material)
        return material
    }

    /**
     * Получает все уникальные типы материалов из коллекции в формате key-value
     * @returns Array of {key: id, value: name} objects
     */
    getUniqueMaterialTypes(): Array<{ key: number, value: string }> {
        const uniqueTypes = new Map<number, string>()

        this.items.forEach(material => {
            const type = material.material_standard?.material_type
            if (type && !uniqueTypes.has(type.getId())) {
                uniqueTypes.set(type.getId(), type.getName())
            }
        })

        return Array.from(uniqueTypes.entries()).map(([key, value]) => ({key, value}))
    }

    /**
     * Получает все уникальные марки материалов из коллекции в формате key-value
     * @returns Array of {key: id, value: name} objects
     */
    getUniqueMaterialBrands(): Array<{ key: number, value: string }> {
        const uniqueBrands = new Map<number, string>()

        this.items.forEach(material => {
            material.material_standard?.material_brands?.getAll().forEach(brand => {
                if (!uniqueBrands.has(brand.getId())) {
                    uniqueBrands.set(brand.getId(), brand.getName())
                }
            })
        })

        return Array.from(uniqueBrands.entries()).map(([key, value]) => ({key, value}))
    }

    /**
     * Получает все уникальные свойства материалов из коллекции в формате key-value
     * @returns {Array<{key: number, value: string}>} Массив объектов с ID и названиями свойств
     */
    getUniqueMaterialProperties(): Array<{ key: number, value: string }> {
        const uniqueProperties = new Map<number, string>()

        this.items.forEach(material => {
            material.material_standard?.material_properties?.getAll().forEach(property => {
                if (!uniqueProperties.has(property.getId())) {
                    uniqueProperties.set(property.getId(), property.getName())
                }
            })
        })

        return Array.from(uniqueProperties.entries()).map(([key, value]) => ({key, value}))
    }

    /**
     * Фильтрует материалы по массиву ID типов материалов
     * @param typeIds - массив ID типов материалов
     * @returns новая коллекция с отфильтрованными материалами
     */
    filterByMaterialTypeIds(typeIds: number[]): this {
        return useMaterialCollectionFilter().filterByMaterialTypeIds(this, typeIds) as this
    }

    /**
     * Фильтрует материалы по массиву ID марок материалов
     * @param brandIds - массив ID марок материалов
     * @param brandIds - массив ID марок материалов
     * @returns новая коллекция с отфильтрованными материалами
     */
    filterByMaterialBrandIds(brandIds: number[]): this {
        return useMaterialCollectionFilter().filterByMaterialBrandIds(this, brandIds) as this
    }

    filterByEveryMaterialBrandIds(brandIds: number[]): this {
        return useMaterialCollectionFilter().filterByEveryMaterialBrandIds(this, brandIds) as this
    }

    /**
     * Фильтрует материалы по массиву ID свойств материалов
     * @param propertyIds - массив ID свойств материалов
     * @returns новая коллекция с отфильтрованными материалами
     */
    filterByMaterialPropertyIds(propertyIds: number[]): this {
        return useMaterialCollectionFilter().filterByMaterialPropertyIds(this, propertyIds) as this
    }

    filterNotJoinedTo(): this {
        return this.filterBy((material: Material) => !material.join_to)
    }

    /**
     * Фильтрует материалы, которые можно использовать в изготовлении при стыковке по длине
     * @returns MaterialCollection
     */
    filterAvailableToJoinTransformation(): this {
        return useMaterialCollectionFilter()
            .filterMaterialsAvailableForJoinTransformation(this) as this
    }

    filterAvailableToJoinToMaterial(material: Material): this {
        const materialBrandsIds = material.material_standard.material_brands.pluck('id');
        return this.filterByEveryMaterialBrandIds(materialBrandsIds)
    }

    filterAvailableToCutTransformation(): this {
        return useMaterialCollectionFilter()
            .filterMaterialsAvailableForCutTransformation(this) as this
    }

    filterAvailableToAngleTransformation(): this {
        return this
    }

    filterAvailableToWedgeTransformation(): this {
        return this
    }

    filterAvailableToBeamJoinTransformation(): this {
        return this
    }

    filterAvailableToBeamSplitTransformation(): this {
        return this
    }

    filterAvailableToAngleSplitTransformation(): this {
        return this
    }

    filterAvailableToEmbeddedTransformation(): this {
        return this
    }

    filterAvailableToSupportTransformation(): this {
        return this
    }

    filterAvailableToKernelTransformation(): this {
        return this
    }

    filterAvailableToFasteningTransformation(): this {
        return this
    }

    /**
     * Находит материалы, которые можно состыковать с переданным материалом
     * Пока реализован только поиск по одинаковому типу материала
     * @param targetMaterial - материал, для которого ищем совместимые
     * @returns новая коллекция с совместимыми материалами
     */
    findCompatibleMaterials(targetMaterial: Material): this {
        return useMaterialCollectionFilter().findCompatibleMaterials(this, targetMaterial) as this
    }

    /**
     * Создает глубокую копию коллекции материалов
     * Каждый материал клонируется с сохранением всех свойств
     * @returns новая коллекция с клонированными материалами
     */
    clone(): MaterialCollection {
        const clonedMaterials = this.items.map(material => {
            // Создаем копию материала с теми же параметрами
            return material.cloneWithNewParams(
                material.quantity,
                material.amount,
                material.cut_operation_uuid,
                true // keepOriginal = true, чтобы сохранить UUID и все метаданные
            )
        })

        // Создаем новую коллекцию из клонированных материалов
        const newCollection = new MaterialCollection([])
        clonedMaterials.forEach(material => newCollection.add(material))

        return newCollection
    }

    /**
     * Фильтрует материалы по полю join_to
     * @param joinToUuid - UUID результата стыковки для фильтрации, если null - показывает материалы без join_to
     * @returns новая коллекция с отфильтрованными материалами
     */
    filterByJoinTo(joinToUuid: string | null = null): MaterialCollection {
        if (joinToUuid === null) {
            // Показываем материалы без join_to (не использованные в стыковке)
            return this.filterBy(material => !material.join_to)
        } else {
            // Показываем материалы с конкретным join_to
            return this.filterBy(material => material.join_to === joinToUuid)
        }
    }
}