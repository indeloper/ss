<script setup lang="ts">
import {ref, computed, onMounted, watch} from 'vue'
import {NForm, NFormItem, NInput, NInputNumber, NSelect, NButton, NSpace, NCard} from 'naive-ui'
import {useMessage} from 'naive-ui'
import {useMaterialLibraryStore} from '~/stores/materialLibrary'
import {storeToRefs} from 'pinia'
import {MaterialBrand} from '~/models/MaterialBrand'
import type {MaterialType} from '~/models/MaterialType'

type FormMaterialBrand = {
  id?: number
  name: string
  description: string | null
  weight: string
  material_type_id: number | null
}

const props = defineProps<{
  show: boolean
  materialBrand: MaterialBrand | null
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'saved'): void
}>()

const materialLibraryStore = useMaterialLibraryStore()
const {types} = storeToRefs(materialLibraryStore)
const message = useMessage()

// Форма
const formRef = ref()
const formValue = ref<FormMaterialBrand>({
  name: '',
  description: null,
  weight: '0',
  material_type_id: null
})

const rules = {
  name: {
    required: true,
    message: 'Введите название',
    trigger: ['input', 'blur']
  },
  material_type_id: {
    required: true,
    type: 'number',
    message: 'Выберите тип материала',
    trigger: ['change', 'blur']
  }
}

// Заголовок модального окна
const title = computed(() => {
  return props.materialBrand ? 'Редактирование бренда' : 'Создание бренда'
})

// Загрузка данных в форму при изменении выбранного бренда
watch(() => props.materialBrand, (newBrand) => {
  if (newBrand) {
    formValue.value = {
      id: newBrand.id,
      name: newBrand.name,
      description: newBrand.description,
      weight: newBrand.weight,
      material_type_id: newBrand.material_type?.id || null
    }
  } else {
    formValue.value = {
      name: '',
      description: null,
      weight: '0',
      material_type_id: null
    }
  }
}, {immediate: true})

// Опции для выбора типа материала
const materialTypeOptions = computed(() => {
  return types.value?.getAll().map((type: MaterialType) => ({
    label: type.name,
    value: type.id
  })) || []
})

// Закрытие модального окна
const handleClose = () => {
  emit('update:show', false)
}

// Сохранение формы
const handleSave = (e: Event) => {
  e.preventDefault()
  
  formRef.value?.validate(async (errors: any) => {
    if (!errors) {
      try {
        if (props.materialBrand) {
          // Редактирование существующего бренда
          await materialLibraryStore.updateMaterialBrand(props.materialBrand.id, {
            name: formValue.value.name,
            description: formValue.value.description,
            weight: formValue.value.weight,
            material_type_id: formValue.value.material_type_id
          })
          message.success('Бренд успешно обновлен')
        } else {
          // Создание нового бренда
          await materialLibraryStore.createMaterialBrand({
            name: formValue.value.name,
            description: formValue.value.description,
            weight: formValue.value.weight,
            material_type_id: formValue.value.material_type_id
          })
          message.success('Бренд успешно создан')
        }
        
        emit('saved')
        handleClose()
      } catch (error) {
        message.error('Ошибка при сохранении бренда')
        console.error('Ошибка при сохранении бренда:', error)
      }
    }
  })
}

onMounted(() => {
  // Убедимся, что типы материалов загружены
  if (!types.value) {
    materialLibraryStore.loadAll()
  }
})
</script>

<template>
  <n-modal
      :show="show"
      @update:show="handleClose"
      :mask-closable="false"
      preset="card"
      :title="title"
      class="w-1/3"
  >
    <n-form
        ref="formRef"
        :model="formValue"
        :rules="rules"
        label-placement="top"
        require-mark-placement="right-hanging"
    >
      <n-form-item label="Название" path="name">
        <n-input
            v-model:value="formValue.name"
            placeholder="Введите название"
        />
      </n-form-item>
      
      <n-form-item label="Описание" path="description">
        <n-input
            v-model:value="formValue.description"
            placeholder="Введите описание"
            type="textarea"
            :autosize="{ minRows: 3 }"
        />
      </n-form-item>
      
      <n-form-item label="Тип материала" path="material_type_id">
        <n-select
            v-model:value="formValue.material_type_id"
            :options="materialTypeOptions"
            placeholder="Выберите тип материала"
        />
      </n-form-item>
      
      <n-form-item label="Вес" path="weight">
        <n-input-number
            v-model:value="formValue.weight"
            placeholder="Введите вес"
            :precision="2"
            :step="0.1"
        />
      </n-form-item>
    </n-form>
    
    <template #footer>
      <n-space justify="end">
        <n-button @click="handleClose">Отмена</n-button>
        <n-button type="primary" @click="handleSave">Сохранить</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style scoped>

</style>
