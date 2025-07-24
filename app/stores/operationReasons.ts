import { defineStore } from 'pinia'
import { ref } from 'vue'
import { OperationReasonCollection } from '~/models/collections/OperationReasonCollection'
import { useOperationReason } from '~/composables/useOperationReason'

export const useOperationReasonsStore = defineStore('operationReasons', () => {
  const transferReasons = ref<OperationReasonCollection>(new OperationReasonCollection())
  const supplyReasons = ref<OperationReasonCollection>(new OperationReasonCollection())
  const writeOffReasons = ref<OperationReasonCollection>(new OperationReasonCollection())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { fetchTransferOperationReasons, fetchSupplyOperationReasons, fetchWriteOffOperationReasons } = useOperationReason()

  const loadTransferReasons = async () => {
    try {
      loading.value = true
      error.value = null
      transferReasons.value = await fetchTransferOperationReasons()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка загрузки причин перемещения'
    } finally {
      loading.value = false
    }
  }

  const loadSupplyReasons = async () => {
    try {
      loading.value = true
      error.value = null
      supplyReasons.value = await fetchSupplyOperationReasons()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка загрузки причин поставки'
    } finally {
      loading.value = false
    }
  }

  const loadWriteOffReasons = async () => {
    try {
      loading.value = true
      error.value = null
      writeOffReasons.value = await fetchWriteOffOperationReasons()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка загрузки причин списания'
    } finally {
      loading.value = false
    }
  }

  return {
    transferReasons,
    supplyReasons,
    writeOffReasons,
    loading,
    error,
    loadTransferReasons,
    loadSupplyReasons,
    loadWriteOffReasons
  }
}) 