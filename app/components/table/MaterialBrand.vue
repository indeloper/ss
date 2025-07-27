<script
    setup
    lang="ts"
>
import {useMaterialLibraryStore} from '~/stores/materialLibrary'
import {storeToRefs} from 'pinia'
import {NDataTable, type DataTableColumns, NButton, NIcon} from 'naive-ui'
import {MaterialBrand} from '~/models/MaterialBrand'
import {computed, ref, h} from 'vue'
import {Edit} from '@vicons/fa'
import FormMaterialBrandEdit from '~/components/form/material/MaterialBrandEdit.vue'

const materialLibraryStore = useMaterialLibraryStore()
const {brands} = storeToRefs(materialLibraryStore)

// Модальное окно редактирования/создания
const showEditModal = ref(false)
const showCreateModal = ref(false)
const selectedMaterialBrand = ref<MaterialBrand | null>(null)

// Обработчик открытия модального окна редактирования
const handleEdit = (materialBrand: MaterialBrand) => {
  selectedMaterialBrand.value = materialBrand
  showEditModal.value = true
}

// Обработчик открытия модального окна создания
const handleCreate = () => {
  selectedMaterialBrand.value = null
  showCreateModal.value = true
}

// Экспортируем функцию создания для использования в родительском компоненте
defineExpose({
  handleCreate
})

const columns: DataTableColumns<MaterialBrand> = [
  {
    title: 'Название',
    key: 'name',
    width: 200
  },
  {
    title: 'Описание',
    key: 'description',
  },
  {
    title: 'Тип материала',
    key: 'material_type',
    width: 200,
    render(row) {
      return row.material_type?.name || ''
    }
  },
  {
    title: 'Вес',
    key: 'weight',
    width: 150
  },
  {
    title: '',
    key: 'actions',
    width: 60,
    render(row) {
      return h(
          NButton,
          {
            quaternary: true,
            onClick: (e: Event) => {
              e.stopPropagation()
              handleEdit(row)
            }
          },
          {
            icon: () => h(NIcon, null, {default: () => h(Edit)})
          }
      )
    }
  }
]

const tableData = computed(() => {
  return brands.value?.getAll() || []
})

// Обработчик сохранения изменений
const handleSaved = () => {
  // После сохранения можно добавить дополнительную логику, если нужно
}

// Обработчик создания нового бренда
const handleCreated = () => {
  // После создания можно добавить дополнительную логику, если нужно
}
</script>

<template>
  <n-data-table
      :columns="columns"
      :data="tableData"
      :bordered="true"
      :single-line="false"
      class="w-full"
      size="small"
  />
  
  <!-- Модальное окно редактирования бренда -->
  <FormMaterialBrandEdit
      v-model:show="showEditModal"
      :material-brand="selectedMaterialBrand"
      @saved="handleSaved"
  />
  
  <!-- Модальное окно создания бренда -->
  <FormMaterialBrandEdit
      v-model:show="showCreateModal"
      :material-brand="null"
      @saved="handleCreated"
  />
</template>

<style scoped>

</style>
