<script setup lang="ts">
import {ref, computed, onMounted, watch} from 'vue'
import {NForm, NFormItem, NInput, NSelect, NButton, NSpace, NCard, NInputNumber} from 'naive-ui'
import {useMessage} from 'naive-ui'
import {useMaterialLibraryStore} from '~/stores/materialLibrary'
import {storeToRefs} from 'pinia'
import {MaterialStandard} from '~/models/MaterialStandard'
import type {MaterialType} from '~/models/MaterialType'
import type {MaterialBrand} from '~/models/MaterialBrand'
import type {MaterialProperty} from '~/models/MaterialProperty'

type FormMaterialStandard = {
  id?: number
  name: string
  description: string
  old_standard_id: number | null
  material_type_id: number | null
  material_brand_ids: number[]
  material_property_ids: number[]
}

const props = defineProps<{
  show: boolean
  materialStandard: MaterialStandard | null
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'saved'): void
}>()

const materialLibraryStore = useMaterialLibraryStore()
const {types, brands, properties} = storeToRefs(materialLibraryStore)
const message = useMessage()

// Форма
const formRef = ref()
const formValue = ref<FormMaterialStandard>({
  name: '',
  description: '',
  old_standard_id: null,
  material_type_id: null,
  material_brand_ids: [],
  material_property_ids: []
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
  return props.materialStandard ? 'Редактирование стандарта' : 'Создание стандарта'
})

// Загрузка данных в форму при изменении выбранного стандарта
watch(() => props.materialStandard, (newStandard) => {
  if (newStandard) {
    formValue.value = {
      id: newStandard.id,
      name: newStandard.name,
      description: newStandard.description,
      old_standard_id: newStandard.old_standard_id,
      material_type_id: newStandard.material_type?.id || null,
      material_brand_ids: newStandard.material_brands?.getAll().map((brand: MaterialBrand) => brand.id) || [],
      material_property_ids: newStandard.material_properties?.getAll().map((prop: MaterialProperty) => prop.id) || []
    }
  } else {
    formValue.value = {
      name: '',
      description: '',
      old_standard_id: null,
      material_type_id: null,
      material_brand_ids: [],
      material_property_ids: []
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

// Опции для выбора брендов материалов
const materialBrandOptions = computed(() => {
  return brands.value?.getAll().map((brand: MaterialBrand) => ({
    label: brand.name,
    value: brand.id
  })) || []
})

// Опции для выбора свойств материалов
const materialPropertyOptions = computed(() => {
  return properties.value?.getAll().map((property: MaterialProperty) => ({
    label: property.name,
    value: property.id
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
        if (props.materialStandard) {
          // Редактирование существующего стандарта
          await materialLibraryStore.updateMaterialStandard(props.materialStandard.id, {
            name: formValue.value.name,
            description: formValue.value.description,
            old_standard_id: formValue.value.old_standard_id,
            material_type_id: formValue.value.material_type_id,
            material_brand_ids: formValue.value.material_brand_ids,
            material_property_ids: formValue.value.material_property_ids
          })
          message.success('Стандарт успешно обновлен')
        } else {
          // Создание нового стандарта
          await materialLibraryStore.createMaterialStandard({
            name: formValue.value.name,
            description: formValue.value.description,
            old_standard_id: formValue.value.old_standard_id,
            material_type_id: formValue.value.material_type_id,
            material_brand_ids: formValue.value.material_brand_ids,
            material_property_ids: formValue.value.material_property_ids
          })
          message.success('Стандарт успешно создан')
        }
        
        emit('saved')
        handleClose()
      } catch (error) {
        message.error('Ошибка при сохранении стандарта')
        console.error('Ошибка при сохранении стандарта:', error)
      }
    }
  })
}

onMounted(() => {
  // Убедимся, что все данные загружены
  if (!types.value || !brands.value || !properties.value) {
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
      
      <n-form-item label="ID старого стандарта" path="old_standard_id">
        <n-input-number
            v-model:value="formValue.old_standard_id"
            placeholder="Введите ID старого стандарта"
        />
      </n-form-item>
      
      <n-form-item label="Тип материала" path="material_type_id">
        <n-select
            v-model:value="formValue.material_type_id"
            :options="materialTypeOptions"
            placeholder="Выберите тип материала"
        />
      </n-form-item>
      
      <n-form-item label="Бренды материалов" path="material_brand_ids">
        <n-select
            v-model:value="formValue.material_brand_ids"
            :options="materialBrandOptions"
            placeholder="Выберите бренды материалов"
            multiple
        />
      </n-form-item>
      
      <n-form-item label="Свойства материалов" path="material_property_ids">
        <n-select
            v-model:value="formValue.material_property_ids"
            :options="materialPropertyOptions"
            placeholder="Выберите свойства материалов"
            multiple
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
