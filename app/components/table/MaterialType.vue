<script setup lang="ts">
import { useMaterialLibraryStore } from '~/stores/materialLibrary'
import { storeToRefs } from 'pinia'
import { NDataTable, type DataTableColumns, NButton, NIcon } from 'naive-ui'
import { MaterialType } from '~/models/MaterialType'
import { computed, ref } from 'vue'
import { Edit } from '@vicons/fa'
import FormMaterialTypeEdit from '~/components/form/material/MaterialTypeEdit.vue'

const materialLibraryStore = useMaterialLibraryStore()
const { types, units, properties } = storeToRefs(materialLibraryStore)

const showEditModal = ref(false)
const showCreateModal = ref(false)
const selectedMaterialType = ref<MaterialType | null>(null)

const handleEdit = (materialType: MaterialType) => {
  selectedMaterialType.value = materialType
  showEditModal.value = true
}

const handleCreate = () => {
  selectedMaterialType.value = null
  showCreateModal.value = true
}

defineExpose({
  handleCreate
})

const columns: DataTableColumns<MaterialType> = [
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
    title: 'Единица измерения',
    key: 'material_unit',
    render(row) {
      return row.material_unit?.label || 'Не указана'
    },
    width: 150
  },
  {
    title: 'Свойства',
    key: 'properties',
    render(row) {
      if (!row.properties || row.properties.length === 0) {
        return 'Нет свойств'
      }
      return row.properties.map(prop => prop.name).join(', ')
    },
    width: 200
  },
  {
    title: 'Фиксированный объем',
    key: 'fixed_quantity',
    render(row) {
      return row.fixed_quantity ? 'Да' : 'Нет'
    },
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
          icon: () => h(NIcon, null, { default: () => h(Edit) })
        }
      )
    }
  }
]

const tableData = computed(() => {
  return types.value?.getAll() || []
})
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
  
  <!-- Модальное окно редактирования -->
  <FormMaterialTypeEdit 
    v-model:show="showEditModal" 
    :material-type="selectedMaterialType"
    :units="units"
    :properties="properties"
    @saved="handleSaved"
  />
  
  <!-- Модальное окно создания -->
  <FormMaterialTypeEdit 
    v-model:show="showCreateModal" 
    :material-type="null"
    :units="units"
    :properties="properties"
    @created="handleCreated"
  />
</template>

<style scoped>

</style>