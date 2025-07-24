import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useMaterial } from '~/composables/useMaterial'
import { MaterialCollection } from '~/models/collections/MaterialCollection'

export const useMaterialsStore = defineStore('materials', () => {
  const activeMaterials = ref<MaterialCollection>(new MaterialCollection())
  const reserveMaterials = ref<MaterialCollection>(new MaterialCollection())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { fetchMaterialsByProjectObjectId } = useMaterial()

  const loadMaterialsByProjectObject = async (projectObjectId: number) => {
    try {
      loading.value = true
      error.value = null
      
      const { active, reserve } = await fetchMaterialsByProjectObjectId(projectObjectId)
      activeMaterials.value = active
      reserveMaterials.value = reserve
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка загрузки материалов'
      console.error('Error fetching materials:', err)
    } finally {
      loading.value = false
    }
  }

  const refreshMaterials = async (projectObjectId: number) => {
    await loadMaterialsByProjectObject(projectObjectId)
  }

  const getActiveMaterials = () => {
    return activeMaterials.value?.getAll() || []
  }

  const getReserveMaterials = () => {
    return reserveMaterials.value?.getAll() || []
  }

  const getActiveMaterialById = (id: number) => {
    return activeMaterials.value?.findById(id)
  }

  const getReserveMaterialById = (id: number) => {
    return reserveMaterials.value?.findById(id)
  }

  const getActiveMaterialsCount = () => {
    return activeMaterials.value?.getCount() || 0
  }

  const getReserveMaterialsCount = () => {
    return reserveMaterials.value?.getCount() || 0
  }

  const isLoaded = () => {
    return activeMaterials.value !== null && reserveMaterials.value !== null
  }

  const clearError = () => {
    error.value = null
  }

  return {
    activeMaterials,
    reserveMaterials,
    loading,
    error,
    loadMaterialsByProjectObject,
    refreshMaterials,
    getActiveMaterials,
    getReserveMaterials,
    getActiveMaterialById,
    getReserveMaterialById,
    getActiveMaterialsCount,
    getReserveMaterialsCount,
    isLoaded,
    clearError
  }
}) 