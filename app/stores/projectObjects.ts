import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useObject } from '~/composables/useObject'
import { ProjectObjectCollection } from '~/models/collections/ProjectObjectCollection'
import { useLoadingBar } from 'naive-ui'

export const useProjectObjectsStore = defineStore('projectObjects', () => {
  const projectObjects = ref<ProjectObjectCollection>(new ProjectObjectCollection())
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedProjectObjectId = ref<number | null>(null)

  const selectedProjectObject = computed(() => {

    if (selectedProjectObjectId.value === null) return null

    return projectObjects.value?.findById(selectedProjectObjectId.value)
  })

  const initSelectedObject = () => {
    const savedId = localStorage.getItem('selectedProjectObjectId')
    if (savedId) {
      selectedProjectObjectId.value = Number(savedId)
    }
  }

  const setSelectedProjectObject = (id: number) => {
    selectedProjectObjectId.value = id
    localStorage.setItem('selectedProjectObjectId', String(id))
  }

  const getSelectedProjectObject = () => {
    if (selectedProjectObjectId.value !== null) {
      return projectObjects.value?.findById(selectedProjectObjectId.value) || null
    }
    return null
  }

  const { fetchWith } = useObject()

  const fetchObjects = async () => {
    try {
      loading.value = true
      error.value = null
      
      const projectObjectCollection = await fetchWith()
      projectObjects.value = projectObjectCollection
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка загрузки объектов'
      console.error('Error fetching objects:', err)
    } finally {
      loading.value = false
    }
  }

  const getAllObjects = () => {
    return projectObjects.value?.getAll() || []
  }

  const getObjectById = (id: number) => {
    return projectObjects.value?.findById(id)
  }

  const getObjectsCount = () => {
    return projectObjects.value?.getCount() || 0
  }

  const isLoaded = () => {
    return projectObjects.value !== null
  }

  const clearError = () => {
    error.value = null
  }

  return {
    projectObjects,
    loading,
    error,
    fetchObjects,
    getAllObjects,
    getObjectById,
    getObjectsCount,
    isLoaded,
    clearError,
    selectedProjectObject,
    selectedProjectObjectId,
    setSelectedProjectObject,
    getSelectedProjectObject,
    initSelectedObject
  }
}) 