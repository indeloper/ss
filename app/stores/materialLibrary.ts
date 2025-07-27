import {defineStore} from 'pinia'
import {ref} from 'vue'
import {useMaterialLibrary} from '~/composables/useMaterialLibrary'
import {MaterialStandardCollection} from '~/models/collections/MaterialStandardCollection'
import {MaterialTypeCollection} from '~/models/collections/MaterialTypeCollection'
import {MaterialBrandCollection} from '~/models/collections/MaterialBrandCollection'
import {MaterialUnitCollection} from '~/models/collections/MaterialUnitCollection'
import {MaterialPropertyCollection} from '~/models/collections/MaterialPropertyCollection'
import {useLoadingBar} from 'naive-ui'

export const useMaterialLibraryStore = defineStore('materialLibrary', () => {
    const standards = ref<MaterialStandardCollection | null>(null)
    const types = ref<MaterialTypeCollection | null>(null)
    const brands = ref<MaterialBrandCollection | null>(null)
    const units = ref<MaterialUnitCollection | null>(null)
    const properties = ref<MaterialPropertyCollection | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const {
        fetchAllMaterialStandardsLibrary,
        fetchAllMaterialTypesLibrary,
        fetchAllMaterialBrandsLibrary,
        fetchAllMaterialUnitsLibrary,
        fetchAllMaterialPropertiesLibrary,
        updateMaterialType: updateMaterialTypeInLibrary,
        createMaterialType: createMaterialTypeInLibrary
    } = useMaterialLibrary()

    const loadAll = async () => {
        try {
            loading.value = true
            error.value = null
            standards.value = await fetchAllMaterialStandardsLibrary()
            types.value = await fetchAllMaterialTypesLibrary()
            brands.value = await fetchAllMaterialBrandsLibrary()
            units.value = await fetchAllMaterialUnitsLibrary()
            properties.value = await fetchAllMaterialPropertiesLibrary()
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Ошибка загрузки библиотеки материалов'
            console.error('Error loading material library:', err)
        } finally {
            loading.value = false
        }
    }

    const createMaterialType = async (data: any) => {
        try {
            const newType = await createMaterialTypeInLibrary(data)
            // Добавляем новый тип в коллекцию
            if (types.value) {
                types.value = await fetchAllMaterialTypesLibrary({forceRefresh: true})
            }
            return newType
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Ошибка создания типа материала'
            console.error('Error creating material type:', err)
            throw err
        }
    }

    const updateMaterialType = async (id: number, data: any) => {
        try {
            const updatedType = await updateMaterialTypeInLibrary(id, data)

            // Обновляем тип в коллекции
            if (types.value) {
                types.value = await fetchAllMaterialTypesLibrary({forceRefresh: true})
            }
            return updatedType
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Ошибка обновления типа материала'
            console.error('Error updating material type:', err)
            throw err
        }
    }

    return {
        standards,
        types,
        brands,
        units,
        properties,
        loading,
        error,
        loadAll,
        createMaterialType,
        updateMaterialType
    }
}) 