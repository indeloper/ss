<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMessage } from 'naive-ui'
import type { MaterialProperty } from '~/models/MaterialProperty'
import { useMaterialLibraryStore } from '~/stores/materialLibrary'
import { storeToRefs } from 'pinia'

const message = useMessage()

// Модель для отображения модального окна
const show = defineModel<boolean>('show', { required: true })

// Пропсы
const props = defineProps<{
  materialProperty: MaterialProperty | null
}>()

// Эмиты
const emit = defineEmits<{
  saved: [materialProperty: MaterialProperty]
  created: [materialProperty: MaterialProperty]
}>()

// Стор
const materialLibraryStore = useMaterialLibraryStore()
const { createMaterialProperty, updateMaterialProperty } = materialLibraryStore

// Форма
const formRef = ref()
const name = ref('')
const description = ref('')
const weightFactor = ref<number>(1)

// Валидация
const formRules = {
  name: {
    required: true,
    message: 'Введите название свойства материала',
    trigger: 'blur'
  }
}

// Сброс формы
const resetForm = () => {
  name.value = ''
  description.value = ''
  weightFactor.value = 1
}

// Загрузка данных свойства материала в форму
watch(() => props.materialProperty, (newProperty) => {
  if (newProperty) {
    name.value = newProperty.name
    description.value = newProperty.description || ''
    weightFactor.value = newProperty.weight_factor
  } else {
    resetForm()
  }
}, { immediate: true })

// Обработчик сохранения (для редактирования)
const handleSave = async () => {
  if (!props.materialProperty) return
  
  try {
    await formRef.value?.validate()
    
    const data = {
      name: name.value,
      description: description.value,
      weight_factor: weightFactor.value
    }
    
    const updatedProperty = await updateMaterialProperty(props.materialProperty.id, data)
    emit('saved', updatedProperty)
    show.value = false
    message.success('Свойство материала успешно обновлено')
  } catch (error) {
    message.error('Ошибка при обновлении свойства материала')
    console.error('Error updating material property:', error)
  }
}

// Обработчик создания
const handleCreate = async () => {
  try {
    await formRef.value?.validate()
    
    const data = {
      name: name.value,
      description: description.value,
      weight_factor: weightFactor.value
    }
    
    const newProperty = await createMaterialProperty(data)
    emit('created', newProperty)
    show.value = false
    message.success('Свойство материала успешно создано')
  } catch (error) {
    message.error('Ошибка при создании свойства материала')
    console.error('Error creating material property:', error)
  }
}

// Обработчик отмены
const handleCancel = () => {
  show.value = false
}

// Определяем, является ли форма формой создания
const isCreateForm = computed(() => {
  return props.materialProperty === null
})
</script>

<template>
  <n-modal v-model:show="show" preset="card" style="width: 600px; max-width: 90vw;">
    <template #header>
      <div class="text-lg font-bold">{{ isCreateForm ? 'Создание нового свойства материала' : 'Редактирование свойства материала' }}</div>
    </template>
    
    <n-form 
      ref="formRef" 
      :model="{ name, description, weightFactor }" 
      :rules="formRules"
      label-placement="top"
      label-width="auto"
    >
      <n-form-item label="Название" path="name">
        <n-input v-model:value="name" placeholder="Введите название" />
      </n-form-item>
      
      <n-form-item label="Описание" path="description">
        <n-input 
          v-model:value="description" 
          placeholder="Введите описание" 
          type="textarea" 
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </n-form-item>
      
      <n-form-item label="Коэффициент веса" path="weightFactor">
        <n-input-number 
          v-model:value="weightFactor" 
          placeholder="Введите коэффициент веса"
          :min="0"
          :step="0.1"
        />
      </n-form-item>
    </n-form>
    
    <template #footer>
      <div class="flex justify-end gap-2">
        <n-button @click="handleCancel">Отмена</n-button>
        <n-button 
          v-if="isCreateForm" 
          type="primary" 
          @click="handleCreate"
        >
          Создать
        </n-button>
        <n-button 
          v-else 
          type="primary" 
          @click="handleSave"
        >
          Сохранить
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<style scoped>

</style>
