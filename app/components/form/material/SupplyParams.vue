<script
    setup
    lang="ts"
>

import type {OperationReasonCollection} from "~/models/collections/OperationReasonCollection";
import type {ContractorCollection} from "~/models/collections/ContractorCollection";
import {FormStatus} from "~/enumerates/FormStatus";

const message = useMessage()

const departureAt = defineModel<number | null>('departureAt', {required: true})
const operationReasonId = defineModel<number | null>('operationReasonId', {required: true})
const contractorId = defineModel<number | null>('contractorId', {required: true})
const ttn = defineModel<string | null>('ttn', {required: true})
const comment = defineModel<string | null>('comment', {required: true})
const files = defineModel<File[] | null>('files', {required: true})

const validated = ref(false)
const userInteracted = ref(false) // Флаг взаимодействия пользователя
const initialValidationDone = ref(false) // Флаг начальной валидации

const props = defineProps<{
  supplyReasons: OperationReasonCollection,
  contractors: ContractorCollection
}>()

const formRef = ref()

const formRules = {
  ttn: {
    required: true,
    message: 'Введите номер ТТН',
    trigger: ['blur'],
  },
  departureAt: {
    required: true,
    type: 'number',
    message: 'Выберите дату',
    trigger: ['blur', 'change'],
  },
  operationReasonId: {
    required: true,
    type: 'number',
    message: 'Выберите причину поставки',
    trigger: ['blur', 'change'],
  },
  contractorId: {
    required: true,
    type: 'number',
    message: 'Выберите поставщика',
    trigger: ['blur', 'change'],
  },
}

const validate = async () => {
  const errors = []

  if (!ttn.value) errors.push('Введите номер ТТН')
  if (!departureAt.value) errors.push('Выберите дату')
  if (!operationReasonId.value) errors.push('Выберите причину поставки')
  if (!contractorId.value) errors.push('Выберите поставщика')

  const isValid = errors.length === 0
  validated.value = isValid

  // Показываем ошибки только после взаимодействия пользователя
  if (!isValid && userInteracted.value) {
    try {
      await formRef.value?.validate()
    } catch (e) {
      // Игнорируем ошибки валидации формы
    }
  }

  return isValid
}

// Проверяем начальное состояние формы при монтировании
const checkInitialState = async () => {
  await nextTick()
  await validate()
  initialValidationDone.value = true
}

const updateUploadedFiles = (newFiles: File[]) => {
  files.value = newFiles
  userInteracted.value = true
}

// Обработчики для отслеживания взаимодействия
const handleFieldInteraction = () => {
  userInteracted.value = true
}

defineExpose({
  validated
})

onMounted(() => {
  checkInitialState()
})

watch([ttn, departureAt, operationReasonId, contractorId], async () => {
  await nextTick()
  await validate()
}, { immediate: false })

</script>

<template>
  <p class="font-medium text-xl mb-4">Параметры поставки</p>
  <n-form
      ref="formRef"
      :model="{
        ttn,
        departureAt,
        operationReasonId,
        contractorId
      }"
      :rules="formRules"
      :show-require-mark="false"
  >
    <div class="grid grid-cols-4 gap-4">
      <n-form-item
          label="Дата"
          path="departureAt"
      >
        <n-date-picker
            type="date"
            format="dd.MM.yyyy"
            v-model:value="departureAt"
            placeholder="Выберите дату"
            class="w-full"
            clearable
            @focus="handleFieldInteraction"
        />
      </n-form-item>

      <n-form-item
          label="Причина поставки"
          path="operationReasonId"
      >
        <n-select
            v-model:value="operationReasonId"
            filterable
            clearable
            placeholder="Выберите причину поставки"
            :options="supplyReasons.getAll().map((reason) => ({label: reason.name, value: reason.id}))"
            @focus="handleFieldInteraction"
        />
      </n-form-item>

      <n-form-item
          label="Поставщик"
          path="contractorId"
      >
        <n-select
            v-model:value="contractorId"
            filterable
            clearable
            placeholder="Выберите поставщика"
            :options="contractors.getAll().filter((c) => !!c.name).map((contractor) => ({label: contractor.name, value: contractor.id}))"
            @focus="handleFieldInteraction"
        />
      </n-form-item>

      <n-form-item
          label="Номер накладной"
          path="ttn"
      >
        <n-input
            v-model:value="ttn"
            placeholder="Укажите номер накладной"
            @focus="handleFieldInteraction"
        />
      </n-form-item>

      <n-form-item
          label="Комментарий"
          path="comment"
          class="col-span-4"
      >
        <n-input
            type="textarea"
            v-model:value="comment"
            placeholder="Укажите дополнительную информацию"
            @focus="handleFieldInteraction"
        />
      </n-form-item>

      <n-form-item
          label="Документы"
          path="files"
          class="col-span-4"
      >
        <UiFileUpload
            :cols="3"
            :model-value="files"
            @update:model-value="updateUploadedFiles"
            class="w-full"
        />
      </n-form-item>

    </div>
  </n-form>
</template>

<style scoped>

</style>