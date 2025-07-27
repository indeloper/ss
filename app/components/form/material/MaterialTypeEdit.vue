<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMessage } from 'naive-ui'
import type { MaterialType } from '~/models/MaterialType'
import type { MaterialUnitCollection } from '~/models/collections/MaterialUnitCollection'
import type { MaterialPropertyCollection } from '~/models/collections/MaterialPropertyCollection'
import { useMaterialLibraryStore } from '~/stores/materialLibrary'
import { storeToRefs } from 'pinia'

const message = useMessage()

// Модель для отображения модального окна
const show = defineModel<boolean>('show', { required: true })

// Пропсы
const props = defineProps<{
  materialType: MaterialType | null
  units: MaterialUnitCollection | null
  properties: MaterialPropertyCollection | null
}>()

// Эмиты
const emit = defineEmits<{
  saved: [materialType: MaterialType]
  created: [materialType: MaterialType]
}>()

// Стор
const materialLibraryStore = useMaterialLibraryStore()
const { createMaterialType, updateMaterialType } = materialLibraryStore

// Форма
const formRef = ref()
const name = ref('')
const description = ref('')
const unitId = ref<number | null>(null)
const fixedQuantity = ref<boolean>(false)
const instruction = ref('')
const propertyIds = ref<number[]>([])

// Валидация
const formRules = {
  name: {
    required: true,
    message: 'Введите название типа материала',
    trigger: 'blur'
  },
  unit_id: {
    required: true,
    message: 'Выберите единицу измерения',
    trigger: 'blur'
  }
}

// Сброс формы
const resetForm = () => {
  name.value = ''
  description.value = ''
  unitId.value = null
  fixedQuantity.value = false
  instruction.value = ''
  propertyIds.value = []
}

// Загрузка данных типа материала в форму
watch(() => props.materialType, (newType) => {
  if (newType) {
    name.value = newType.name
    description.value = newType.description
    unitId.value = newType.unit_id || null
    fixedQuantity.value = newType.fixed_quantity || false
    instruction.value = newType.instruction || ''
    propertyIds.value = newType.getPropertyIds()
  } else {
    resetForm()
  }
}, { immediate: true })

// Обработчик сохранения (для редактирования)
const handleSave = async () => {
  if (!props.materialType) return
  
  try {
    await formRef.value?.validate()
    
    // Фильтруем пустые значения из propertyIds
    const validPropertyIds = propertyIds.value.filter(id => id !== null && id !== undefined)
    
    const data = {
      name: name.value,
      description: description.value,
      unit_id: unitId.value,
      fixed_quantity: fixedQuantity.value,
      instruction: instruction.value,
      property_ids: validPropertyIds
    }
    
    const updatedType = await updateMaterialType(props.materialType.id, data)
    emit('saved', updatedType)
    show.value = false
    message.success('Тип материала успешно обновлен')
  } catch (error) {
    message.error('Ошибка при обновлении типа материала')
    console.error('Error updating material type:', error)
  }
}

// Обработчик создания
const handleCreate = async () => {
  try {
    await formRef.value?.validate()
    
    // Фильтруем пустые значения из propertyIds
    const validPropertyIds = propertyIds.value.filter(id => id !== null && id !== undefined)
    
    const data = {
      name: name.value,
      description: description.value,
      unit_id: unitId.value,
      fixed_quantity: fixedQuantity.value,
      instruction: instruction.value,
      property_ids: validPropertyIds
    }
    
    const newType = await createMaterialType(data)
    emit('created', newType)
    show.value = false
    message.success('Тип материала успешно создан')
  } catch (error) {
    message.error('Ошибка при создании типа материала')
    console.error('Error creating material type:', error)
  }
}

// Обработчик отмены
const handleCancel = () => {
  show.value = false
}

// Список единиц измерения для селекта
const unitOptions = computed(() => {
  if (!props.units) return []
  return props.units.getAll().map(unit => ({
    label: unit.label,
    value: unit.id
  }))
})

// Список свойств для мультиселекта
const propertyOptions = computed(() => {
  if (!props.properties) return []
  return props.properties.getAll().map(property => ({
    label: property.name,
    value: property.id
  }))
})

// Определяем, является ли форма формой создания
const isCreateForm = computed(() => {
  return props.materialType === null
})
</script>

<template>
  <n-modal v-model:show="show" preset="card" style="width: 600px; max-width: 90vw;">
    <template #header>
      <div class="text-lg font-bold">{{ isCreateForm ? 'Создание нового типа материала' : 'Редактирование типа материала' }}</div>
    </template>
    
    <n-form 
      ref="formRef" 
      :model="{ name, description, unitId, fixedQuantity, instruction, propertyIds }" 
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
      
      <n-form-item label="Единица измерения" path="unitId">
        <n-select 
          v-model:value="unitId" 
          :options="unitOptions" 
          placeholder="Выберите единицу измерения"
        />
      </n-form-item>
      
      <n-form-item label="Свойства">
        <n-select 
          v-model:value="propertyIds" 
          multiple
          :options="propertyOptions" 
          placeholder="Выберите свойства"
        />
      </n-form-item>
      
      <n-form-item label="Инструкция" path="instruction">
        <n-input 
          v-model:value="instruction" 
          placeholder="Введите инструкцию" 
          type="textarea" 
          :autosize="{ minRows: 3, maxRows: 6 }"
        />
      </n-form-item>
      
      <n-form-item label="Фиксированный объем">
        <n-switch v-model:value="fixedQuantity" />
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
