<template>
  <n-modal
      v-model:show="showModal"
      preset="dialog"
      title="Подтверждение результата стыковки"
      :show-icon="false"
      :closable="false"
      :mask-closable="false"
  >
    <div class="py-4">
      <p class="text-gray-600 mb-4">
        Вы уверены, что хотите подтвердить результат стыковки материалов?
      </p>
      
      <!-- Здесь будет форма для настройки параметров стыковки -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <p class="text-sm text-gray-500">
          Форма настройки параметров будет добавлена позже
        </p>
      </div>
    </div>

    <template #action>
      <div class="flex gap-2">
        <n-button @click="handleCancel">
          Отмена
        </n-button>
        <n-button type="primary" @click="handleConfirm">
          Подтвердить
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showModal = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value)
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>
