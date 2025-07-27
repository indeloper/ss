import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useMaterialLibrary } from '~/composables/useMaterialLibrary'
import { MaterialStandardCollection } from '~/models/collections/MaterialStandardCollection'
import { MaterialTypeCollection } from '~/models/collections/MaterialTypeCollection'
import { MaterialBrandCollection } from '~/models/collections/MaterialBrandCollection'
import { MaterialUnitCollection } from '~/models/collections/MaterialUnitCollection'
import { MaterialPropertyCollection } from '~/models/collections/MaterialPropertyCollection'

export const useMaterialLibraryStore = defineStore('materialLibrary', () => {
  // State
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
    fetchAllMaterialPropertiesLibrary
  } = useMaterialLibrary()

  
  // Actions
  const loadAll = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Load all collections in parallel
      const [fetchedStandards, fetchedTypes, fetchedBrands, fetchedUnits, fetchedProperties] = await Promise.all([
        fetchAllMaterialStandardsLibrary(),
        fetchAllMaterialTypesLibrary(),
        fetchAllMaterialBrandsLibrary(),
        fetchAllMaterialUnitsLibrary(),
        fetchAllMaterialPropertiesLibrary()
      ])
      
      standards.value = fetchedStandards
      types.value = fetchedTypes
      brands.value = fetchedBrands
      units.value = fetchedUnits
      properties.value = fetchedProperties
    } catch (err) {
      error.value = 'Ошибка при загрузке библиотеки материалов'
      console.error('Error loading material library:', err)
    } finally {
      loading.value = false
    }
  }
  
  const createMaterialType = async (data: any) => {
    try {
      const { createMaterialType: createMaterialTypeInLibrary } = useMaterialLibrary()
      const newType = await createMaterialTypeInLibrary(data)
      // Добавляем новый тип в коллекцию
      if (types.value) {
        types.value = await fetchAllMaterialTypesLibrary({forceRefresh: true})
      }
      return newType
    } catch (err) {
      error.value = 'Ошибка при создании типа материала'
      console.error('Error creating material type:', err)
      throw err
    }
  }
  
  const updateMaterialType = async (id: number, data: any) => {
    try {
      const { updateMaterialType: updateMaterialTypeInLibrary } = useMaterialLibrary()
      const updatedType = await updateMaterialTypeInLibrary(id, data)
      
      // Обновляем тип в коллекции
      if (types.value) {
        types.value = await fetchAllMaterialTypesLibrary({forceRefresh: true})
      }
      return updatedType
    } catch (err) {
      error.value = 'Ошибка при обновлении типа материала'
      console.error('Error updating material type:', err)
      throw err
    }
  }
  
  const createMaterialProperty = async (data: any) => {
    try {
      const { createMaterialProperty: createMaterialPropertyInLibrary } = useMaterialLibrary()
      const newProperty = await createMaterialPropertyInLibrary(data)
      // Обновляем коллекцию свойств
      if (properties.value) {
        const { fetchAllMaterialPropertiesLibrary } = useMaterialLibrary()
        properties.value = await fetchAllMaterialPropertiesLibrary({forceRefresh: true})
      }
      return newProperty
    } catch (err) {
      error.value = 'Ошибка при создании свойства материала'
      console.error('Error creating material property:', err)
      throw err
    }
  }
  
  const updateMaterialProperty = async (id: number, data: any) => {
    try {
      const { updateMaterialProperty: updateMaterialPropertyInLibrary } = useMaterialLibrary()
      const updatedProperty = await updateMaterialPropertyInLibrary(id, data)
      
      // Обновляем свойство в коллекции
      if (properties.value) {
        const { fetchAllMaterialPropertiesLibrary } = useMaterialLibrary()
        properties.value = await fetchAllMaterialPropertiesLibrary({forceRefresh: true})
      }
      return updatedProperty
    } catch (err) {
      error.value = 'Ошибка при обновлении свойства материала'
      console.error('Error updating material property:', err)
      throw err
    }
  }
  
  return {
    // State
    standards,
    types,
    brands,
    units,
    properties,
    loading,
    error,
    
    // Actions
    loadAll,
    createMaterialType,
    updateMaterialType,
    createMaterialProperty,
    updateMaterialProperty
  }
})