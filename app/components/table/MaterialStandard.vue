<script
    setup
    lang="ts"
>
import type {MaterialStandardCollection} from "~/models/collections/MaterialStandardCollection";
import type {MaterialStandard} from "~/models/MaterialStandard";
import type {DataTableColumns} from "naive-ui";
import type {RowData} from "naive-ui/es/data-table/src/interface";
import {useMaterialStandardFilter} from "~/composables/useMaterialStandardFilter";
import {Trash, Plus} from '@vicons/fa'
import {NIcon, NButton, NInputNumber} from 'naive-ui'
import FormMaterialStandardEdit from '~/components/form/material/MaterialStandardEdit.vue'

const props = withDefaults(defineProps<{
  standards: MaterialStandardCollection | null,
  loading: boolean,
  stickyGroups?: boolean,
  enableFiltering?: boolean,
  enableGrouping?: boolean,
  enableSorting?: boolean,
  enableSearch?: boolean,
  enableSelection?: boolean,
  selectedRowKeys?: (string | number)[],
  rowKey?: string,
  enableDelete?: boolean,
  description?: string,
  expandGroupsByDefault?: boolean,
  hideTotalWeight?: boolean,
  enableCreate?: boolean
}>(), {
  expandGroupsByDefault: true,
  hideTotalWeight: false,
  enableCreate: true
})

const emit = defineEmits<{
  'update:selectedRowKeys': [keys: (string | number)[]],
  'delete:standard': [standard: MaterialStandard],
  'row:click': [standard: MaterialStandard]
}>()

const {
  filters,
  sortState,
  getMaterialTypes,
  getMaterialBrands,
  getMaterialProperties,
  filterStandards,
  sortStandards,
  groupStandardsByType,
  handleFiltersChange,
  handleSorterChange
} = useMaterialStandardFilter()

const expandedRowKeys = ref<string[]>([])
const showEditModal = ref(false)
const showCreateModal = ref(false)
const selectedMaterialStandard = ref<MaterialStandard | null>(null)

const allStandards = computed(() => props.standards?.getAll() ?? [])
const displayData = ref<MaterialStandard[]>([])

const materialTypes = computed(() => getMaterialTypes(allStandards.value))
const materialBrands = computed(() => getMaterialBrands(allStandards.value))
const materialProperties = computed(() => getMaterialProperties(allStandards.value))

// Вычисляем общий вес всех стандартов
const totalWeight = computed(() => {
  if (!allStandards.value.length) return 0
  return allStandards.value.reduce((sum, standard) => {
    const brandWeight = standard.material_brands?.getAll().reduce((brandSum: number, brand: any) => 
      brandSum + (Number(brand.weight) || 0), 0) || 0
    return sum + brandWeight
  }, 0)
})

const filterData = () => {
  if (!props.standards) {
    displayData.value = []
    return
  }
  let filtered = [...allStandards.value]
  
  if (props.enableFiltering || props.enableSearch) {
    filtered = filterStandards(filtered)
  }
  if (props.enableSorting) {
    filtered = sortStandards(filtered)
  }
  displayData.value = filtered
}

const handleTableFiltersChange = (newFilters: any) => {
  if (props.enableFiltering) {
    handleFiltersChange(newFilters)
    filterData()
  }
}

const handleTableSorterChange = (sorter: any) => {
  if (props.enableSorting) {
    handleSorterChange(sorter)
    filterData()
  }
}

const handleExpandedRowKeysChange = (keys: (string | number)[]) => {
  if (props.enableGrouping) {
    expandedRowKeys.value = keys.map(String)
  }
}

const handleSelectionChange = (keys: (string | number)[]) => {
  if (!props.enableSelection) return

  let newKeys: string[] = []
  keys.forEach(key => {
    const strKey = String(key)
    if (strKey.startsWith('group-')) {
      // Найти группу по ключу
      const group = groupedData.value.find((g: any) => `group-${g.uuid || g.title || g.key}` === strKey)
      if (group && Array.isArray(group.children)) {
        newKeys.push(...group.children.map((child: any) => child.uuid))
      }
    } else {
      newKeys.push(strKey)
    }
  })
  // Удалить дубликаты
  newKeys = Array.from(new Set(newKeys))
  emit('update:selectedRowKeys', newKeys)
}

const handleEdit = (materialStandard: MaterialStandard) => {
  selectedMaterialStandard.value = materialStandard
  showEditModal.value = true
}

const handleCreate = () => {
  selectedMaterialStandard.value = null
  showCreateModal.value = true
}

const selectedKeys = computed({
  get: () => (props.selectedRowKeys || []).map(String),
  set: (value) => emit('update:selectedRowKeys', value.map(String))
})

const getRowKey = (row: any) => {
  if (row.type === 'group') {
    return `group-${row.uuid || row.title || row.key}`
  }
  return row.uuid
}

const handleRowClick = (row: RowData) => {
  if (row.type === 'group') return
  emit('row:click', row as MaterialStandard)
}

watch(() => props.standards, filterData, {immediate: true})
watch(() => props.standards?.getAll(), filterData, {deep: true})
watch(() => filters.searchText, filterData)

const groupedData = computed(() => {
  let data = props.enableGrouping ? groupStandardsByType(displayData.value) : displayData.value

  // Добавляем итоговую строку как первую строку, если не скрыта
  if (!props.hideTotalWeight && allStandards.value.length > 0) {
    const totalRow = {
      type: 'total',
      uuid: 'total-row',
      totalWeight: totalWeight.value
    }
    data = [totalRow, ...data]
  }

  return data
})

// Автоматически раскрываем все группы при изменении данных
const updateExpandedKeys = () => {
  if (props.enableGrouping && groupedData.value) {
    const groupKeys = groupedData.value
        .filter((item: any) => item.type === 'group')
        .map((group: any) => `group-${group.uuid || group.title || group.key}`)

    expandedRowKeys.value = props.expandGroupsByDefault ? groupKeys : []
  }
}

// Следим за изменениями в группированных данных
watch(groupedData, updateExpandedKeys, {immediate: true})

const columns = computed<DataTableColumns<RowData>>(() => {
  const baseColumns = [
    {
      title: props.enableGrouping ? 'Тип / Наименование' : 'Наименование',
      key: 'name',
      fixed: 'left' as const,
      filter: props.enableFiltering,
      filterOptions: props.enableFiltering ? materialTypes.value.map(type => ({
        label: type,
        value: type
      })) : undefined,
      filterOptionValues: props.enableFiltering ? Array.from(filters.typeFilter) : undefined,
      sorter: props.enableSorting ? (a: RowData, b: RowData) => {
        const aName = a.name || ''
        const bName = b.name || ''
        return aName.localeCompare(bName)
      } : undefined,
      render(row: RowData) {
        if (row.type === 'total') {
          return h('span', {class: 'font-bold'}, 'ИТОГО')
        }
        if (props.enableGrouping && row.type === 'group') {
          return h('span', {class: 'font-bold'}, `${row.title} (${row.children.length})`)
        }
        return h('span', {class: 'font-medium'}, row.name || '')
      }
    },
    {
      title: 'Марки',
      key: 'material_brands',
      fixed: 'left' as const,
      filter: props.enableFiltering,
      filterOptions: props.enableFiltering ? materialBrands.value.map(brand => ({
        label: brand,
        value: brand
      })) : undefined,
      filterOptionValues: props.enableFiltering ? Array.from(filters.brandFilter) : undefined,
      sorter: props.enableSorting ? (a: RowData, b: RowData) => {
        const aBrands = a.material_brands?.getAll().map((brand: any) => brand.name).join(', ') || ''
        const bBrands = b.material_brands?.getAll().map((brand: any) => brand.name).join(', ') || ''
        return aBrands.localeCompare(bBrands)
      } : undefined,
      render(row: RowData) {
        if (row.type === 'total') return ''
        if (props.enableGrouping && row.type === 'group') return ''
        if (!row.material_brands) return ''
        const brandsText = row.material_brands.getAll().map((materialBrand: any) => materialBrand.name).join(', ')
        return h('span', brandsText)
      }
    },
    {
      title: 'Свойства',
      key: 'material_properties',
      fixed: 'left' as const,
      filter: props.enableFiltering,
      filterOptions: props.enableFiltering ? materialProperties.value.map(prop => ({
        label: prop,
        value: prop
      })) : undefined,
      filterOptionValues: props.enableFiltering ? Array.from(filters.propertyFilter) : undefined,
      sorter: props.enableSorting ? (a: RowData, b: RowData) => {
        const aProps = a.material_properties?.getAll().map((prop: any) => prop.name).join(', ') || ''
        const bProps = b.material_properties?.getAll().map((prop: any) => prop.name).join(', ') || ''
        return aProps.localeCompare(bProps)
      } : undefined,
      render(row: RowData) {
        if (row.type === 'total') return ''
        if (props.enableGrouping && row.type === 'group') return ''
        if (!row.material_properties) return ''
        return row.material_properties.getAll().map((materialProperty: any) => materialProperty.name).join(', ')
      }
    },
    {
      title: 'Вес марок',
      key: 'total_weight',
      fixed: 'left' as const,
      sorter: props.enableSorting ? (a: RowData, b: RowData) => {
        const aWeight = a.material_brands?.getAll().reduce((sum: number, brand: any) => sum + (Number(brand.weight) || 0), 0) || 0
        const bWeight = b.material_brands?.getAll().reduce((sum: number, brand: any) => sum + (Number(brand.weight) || 0), 0) || 0
        return aWeight - bWeight
      } : undefined,
      render(row: RowData) {
        if (row.type === 'total') {
          return h('span', {class: 'font-bold'}, `${row.totalWeight.toFixed(3)} т.`)
        }
        if (props.enableGrouping && row.type === 'group') {
          return h('span', {class: 'font-bold'}, `${row.groupWeight.toFixed(3)} т.`)
        }
        const weight = row.material_brands?.getAll().reduce((sum: number, brand: any) => sum + (Number(brand.weight) || 0), 0) || 0
        return `${weight.toFixed(3)} т.`
      }
    },
    {
      title: 'Описание',
      key: 'description',
      sorter: props.enableSorting ? (a: RowData, b: RowData) => {
        const aDesc = a.description || ''
        const bDesc = b.description || ''
        return aDesc.localeCompare(bDesc)
      } : undefined,
      render(row: RowData) {
        if (row.type === 'total') return ''
        if (props.enableGrouping && row.type === 'group') return ''
        return row.description || ''
      }
    }
  ]

  if (props.enableSelection) {
    baseColumns.unshift({
      type: 'selection',
      options: ['none', 'all'],
      width: 50
    } as any)
  }

  if (props.enableDelete) {
    baseColumns.push({
      title: '',
      key: 'delete',
      fixed: 'right' as const,
      width: 60,
      render(row: RowData) {
        if (row.type === 'total' || row.type === 'group') return ''
        const standard = row as MaterialStandard
        return h(
            NButton,
            {
              quaternary: true,
              type: 'error',
              class: 'delete-btn',
              onClick: (e: Event) => {
                e.stopPropagation()
                emit('delete:standard', standard)
              }
            },
            [h(NIcon, null, {default: () => h(Trash)})]
        )
      }
    })
  }

  return baseColumns
})

const rowProps = (row: MaterialStandard) => ({
  onClick: () => handleRowClick(row),
})

</script>

<template>
  <n-space
      v-if="enableSearch"
      align="center"
      class="mb-4"
  >
    <n-input
        v-model:value="filters.searchText"
        placeholder="Поиск по названию, описанию, маркам, свойствам, весам, ID..."
        clearable
        style="width: 400px"
    />
    <n-button 
        v-if="enableCreate" 
        type="primary" 
        @click="handleCreate"
    >
      <template #icon>
        <n-icon>
          <Plus />
        </n-icon>
      </template>
      Добавить
    </n-button>
    <div class="filter-info">
      Показано: {{ displayData.length }} из {{ allStandards.length }} стандартов
    </div>
  </n-space>
  
  <div class="flex flex-1 flex-col h-full">
    <div class="flex-1 min-h-0 overflow-hidden">
      <n-data-table
          :remote="enableFiltering || enableSorting"
          :columns="columns"
          :data="groupedData"
          :loading="loading"
          virtual-scroll
          bordered
          class="h-full"
          :scroll-x="800"
          :max-height="900"
          :row-key="getRowKey"
          :sort-state="enableSorting ? sortState : undefined"
          :expanded-row-keys="enableGrouping ? expandedRowKeys : undefined"
          :checked-row-keys="enableSelection ? selectedKeys : undefined"
          @update:filters="handleTableFiltersChange"
          @update:sorter="handleTableSorterChange"
          @update:expanded-row-keys="handleExpandedRowKeysChange"
          @update:checked-row-keys="handleSelectionChange"
          :row-props="rowProps"
      />
    </div>
  </div>
    
  <!-- Модальное окно редактирования -->
  <FormMaterialStandardEdit
      v-model:show="showEditModal"
      :material-standard="selectedMaterialStandard"
  />
  
  <!-- Модальное окно создания -->
  <FormMaterialStandardEdit
      v-model:show="showCreateModal"
      :material-standard="null"
  />
</template>

<style scoped>
</style>