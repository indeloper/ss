<script
    setup
    lang="ts"
>
import {useMaterialLibraryStore} from '~/stores/materialLibrary'
import {storeToRefs} from 'pinia'
import {NDataTable, type DataTableColumns, NButton, NIcon} from 'naive-ui'
import {MaterialProperty} from '~/models/MaterialProperty'
import {computed, ref, h, onBeforeMount} from 'vue'
import {Edit, Plus} from '@vicons/fa'
import FormMaterialPropertyEdit from '~/components/form/material/MaterialPropertyEdit.vue'

const materialLibraryStore = useMaterialLibraryStore()
const {properties} = storeToRefs(materialLibraryStore)

// Модальное окно редактирования/создания
const showEditModal = ref(false)
const showCreateModal = ref(false)
const selectedMaterialProperty = ref<MaterialProperty | null>(null)

// Обработчик открытия модального окна редактирования
const handleEdit = (materialProperty: MaterialProperty) => {
  selectedMaterialProperty.value = materialProperty
  showEditModal.value = true
}

// Обработчик открытия модального окна создания
const handleCreate = () => {
  selectedMaterialProperty.value = null
  showCreateModal.value = true
}

const columns: DataTableColumns<MaterialProperty> = [
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
    title: 'Коэффициент веса',
    key: 'weight_factor',
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
  return properties.value?.getAll() || []
})

onBeforeMount(() => {
  materialLibraryStore.loadAll()
})

const handleSaved = () => {
}

// Обработчик создания нового свойства
const handleCreated = () => {
}
</script>

<template>
  <ui-card title="Свойства материалов" class="w-full">
    <template #actions>
      <n-button
          type="primary"
          @click="handleCreate"
      >
        <template #icon>
          <n-icon>
            <Plus/>
          </n-icon>
        </template>
        Добавить
      </n-button>
    </template>

    <n-data-table
        :columns="columns"
        :data="tableData"
        :bordered="true"
        :single-line="false"
        class="w-full"
        size="small"
    />
  </ui-card>

  <!-- Модальное окно редактирования -->
  <FormMaterialPropertyEdit
      v-model:show="showEditModal"
      :material-property="selectedMaterialProperty"
      @saved="handleSaved"
  />

  <!-- Модальное окно создания -->
  <FormMaterialPropertyEdit
      v-model:show="showCreateModal"
      :material-property="null"
      @created="handleCreated"
  />
</template>

<style scoped>

</style>
