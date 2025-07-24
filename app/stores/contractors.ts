import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ContractorCollection } from '~/models/collections/ContractorCollection'
import { ContractorAdapter } from '~/models/adapters/ContractorAdapter'
import { useContractor } from '~/composables/useContractor'

export const useContractorsStore = defineStore('contractors', () => {
  const contractors = ref<ContractorCollection>(new ContractorCollection())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadContractors = async () => {
    try {
      loading.value = true
      error.value = null
      const { fetchContractors } = useContractor()
      contractors.value = await fetchContractors()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка загрузки контрагентов'
      console.error('Error fetching contractors:', err)
    } finally {
      loading.value = false
    }
  }

  const getAllContractors = () => {
    return contractors.value.getAll()
  }

  const getContractorById = (id: number) => {
    return contractors.value.findById(id)
  }

  const getContractorsCount = () => {
    return contractors.value.getCount()
  }

  const isLoaded = () => {
    return contractors.value.getCount() > 0
  }

  return {
    contractors,
    loading,
    error,
    loadContractors,
    getAllContractors,
    getContractorById,
    getContractorsCount,
    isLoaded
  }
}) 