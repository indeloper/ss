import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useMaterialLibrary } from '~/composables/useMaterialLibrary'
import { MaterialStandardCollection } from '~/models/collections/MaterialStandardCollection'
import { MaterialTypeCollection } from '~/models/collections/MaterialTypeCollection'
import { MaterialBrandCollection } from '~/models/collections/MaterialBrandCollection'
import { MaterialUnitCollection } from '~/models/collections/MaterialUnitCollection'
import { MaterialPropertyCollection } from '~/models/collections/MaterialPropertyCollection'
import { useLoadingBar } from 'naive-ui'

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
    fetchAllMaterialPropertiesLibrary
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

  return {
    standards,
    types,
    brands,
    units,
    properties,
    loading,
    error,
    loadAll
  }
}) 