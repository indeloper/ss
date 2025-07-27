<script
    setup
    lang="ts"
>

import type {MaterialStandardCollection} from "~/models/collections/MaterialStandardCollection";
import type {MaterialStandard} from "~/models/MaterialStandard";
import type {RowData} from "naive-ui/es/data-table/src/interface";
import {Trash, Edit, Plus} from '@vicons/fa'
import {NIcon, NButton} from 'naive-ui'
import {computed, ref, h} from 'vue'
import FormMaterialStandardEdit from '~/components/form/material/MaterialStandardEdit.vue'

const emit = defineEmits<{
  (e: 'rowClick', uuid: string): void,
  (e: 'delete:standard', standard: MaterialStandard): void
}>()

const props = defineProps<{
  materialStandards: MaterialStandardCollection,
  enableDelete?: boolean
}>()

const showEditModal = ref(false)
const showCreateModal = ref(false)
const selectedMaterialStandard = ref<MaterialStandard | null>(null)

const handleEdit = (materialStandard: MaterialStandard) => {
  selectedMaterialStandard.value = materialStandard
  showEditModal.value = true
}

const handleCreate = () => {
  selectedMaterialStandard.value = null
  showCreateModal.value = true
}

const search = ref('')

const filteredMaterialStandards = computed<MaterialStandard[]>(() => {
  const all = props.materialStandards.getAll()
  if (!search.value.trim()) return all
  const q = search.value.trim().toLowerCase()
  return all.filter((standard) => {
    const typeName = standard.material_type.name?.toLowerCase() || ''
    const brands = standard.material_brands.getAll().map((b: any) => b.name?.toLowerCase() || '').join(', ')
    const propsStr = standard.material_properties?.getAll().map((p: any) => p.name?.toLowerCase() || '').join(', ')
    return (
        typeName.includes(q) ||
        brands.includes(q) ||
        propsStr.includes(q)
    )
  })
})

const columns = computed<any[]>(() => {
  const base: any[] = [
    {
      title: 'Наименование',
      key: 'material_type.name',
      render(row: MaterialStandard) {

        let name = `${row.material_type.name} ${row.material_brands.getAll().map((brand: any) => brand.name).join(', ')}`

        if (row.material_properties?.getAll().length > 0) {
          name += ` (${row.material_properties.getAll().map((prop: any) => prop.name).join(', ')})`
        }

        return name
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 120,
      render(row: MaterialStandard) {
        return h('div', { class: 'flex space-x-2' }, [
          h(
            NButton,
            {
              strong: true,
              tertiary: true,
              circle: true,
              size: 'small',
              onClick: (e: Event) => {
                e.stopPropagation()
                handleEdit(row)
              }
            },
            {
              icon: () => h(NIcon, null, { default: () => h(Edit) })
            }
          )
        ])
      }
    }
  ]
  if (props.enableDelete) {
    base.push({
      title: '',
      key: 'actions',
      width: 60,
      render(row: MaterialStandard) {
        return h(
            'button',
            {
              class: 'delete-btn',
              onClick: (e: Event) => {
                e.stopPropagation()
                emit('delete:standard', row)
              }
            },
            [h(NIcon, null, {default: () => h(Trash)})]
        )
      }
    })
  }
  return base
})

const rowProps = (row: MaterialStandard) => ({
  onClick: () => {
    emit('rowClick', row.uuid)
  },
})
</script>

<template>
  <div class="flex-1 flex flex-col h-full">
    <div class="flex justify-between items-center mb-3">
      <n-input
          v-model:value="search"
          placeholder="Поиск по наименованию, бренду или свойству..."
          clearable
          class="w-full mr-2"
      />
      <n-button type="primary" @click="handleCreate">
        <template #icon>
          <n-icon>
            <Plus />
          </n-icon>
        </template>
        Добавить
      </n-button>
    </div>
    <div class="flex-1 min-h-0">
      <n-data-table
          :columns="columns"
          :data="filteredMaterialStandards"
          virtual-scroll
          bordered
          max-height="100%"
          :row-props="rowProps"
          style="height: 100%;"
      />
    </div>
    
    <!-- Модальное окно редактирования -->
    <FormMaterialStandardEdit
        v-model:show="showEditModal"
        :material-standard="selectedMaterialStandard"
        @saved="handleSaved"
    />
    
    <!-- Модальное окно создания -->
    <FormMaterialStandardEdit
        v-model:show="showCreateModal"
        :material-standard="null"
        @saved="handleCreated"
    />
  </div>
</template>

<style scoped>
.delete-btn {
  background: none;
  border: none;
  color: #e53e3e;
  font-size: 18px;
  cursor: pointer;
}
</style>