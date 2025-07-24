<script
    setup
    lang="ts"
>

import type {OperationReasonCollection} from "~/models/collections/OperationReasonCollection";
import type {ContractorCollection} from "~/models/collections/ContractorCollection";
import {FormStatus} from "~/enumerates/FormStatus";

const message = useMessage()

const departureAt = defineModel<number | null>('departureAt', {required: true})
const comment = defineModel<string | null>('comment', {required: true})

const validated = ref(false)
const userInteracted = ref(false)
const initialValidationDone = ref(false)

const formRef = ref()

const formRules = {
  departureAt: {
    required: true,
    type: 'number',
    message: 'Выберите дату',
    trigger: ['blur', 'change'],
  },
}

const validate = async () => {
  const errors = []

  if (!departureAt.value) errors.push('Выберите дату')

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

watch([ departureAt], async () => {
  await nextTick()
  await validate()
}, { immediate: false })

</script>

<template>
  <p class="font-medium text-xl mb-4">Параметры поставки</p>
  <n-form
      ref="formRef"
      :model="{
        departureAt,
      }"
      :rules="formRules"
      :show-require-mark="false"
  >
    <div class="grid grid-cols-4 gap-4">
      <n-form-item
          class="col-span-4"
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
    </div>
  </n-form>
</template>

<style scoped>

</style>