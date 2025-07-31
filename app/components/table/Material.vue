<script
    setup
    lang="ts"
>
import {Material} from "~/models/Material";
import type {MaterialCollection} from "~/models/collections/MaterialCollection";
import type {DataTableColumns} from "naive-ui";
import type {RowData} from "naive-ui/es/data-table/src/interface";
import {useMaterialFilter} from "../../../composables/useMaterialFilter";
import _ from 'lodash';
import MaterialEditCell from './MaterialEditCell.vue';
import {Trash, ExchangeAlt} from '@vicons/fa'
import {NIcon, NButton, NInputNumber} from 'naive-ui'
import {useResizeObserver} from "@vueuse/core";
import type {MaterialStandard} from "~/models/MaterialStandard";

const props = withDefaults(defineProps<{
  materials: MaterialCollection | null,
  loading: boolean,
  stickyGroups?: boolean,
  enableFiltering?: boolean,
  enableGrouping?: boolean,
  enableSorting?: boolean,
  enableSearch?: boolean,
  enableNumericFilters?: boolean,
  enableSelection?: boolean,
  selectedRowKeys?: (string | number)[],
  rowKey?: string,
  enableEditing?: boolean,
  editMode?: 'edit' | 'create',
  enableDelete?: boolean,
  enableChanging?: boolean,
  description?: string,
  expandGroupsByDefault?: boolean,
  showInitials?: boolean,
  hideTotalWeight?: boolean
}>(), {
  expandGroupsByDefault: true,
  hideTotalWeight: false
})

const emit = defineEmits<{
  'update:selectedRowKeys': [keys: (string | number)[]],
  'update:material': [material: Material, field: string, value: number],
  'delete:material': [material: Material],
  'change:material': [material: Material],
  'row:click': [material: Material]
}>()

const {
  filters,
  sortState,
  getMaterialTypes,
  getMaterialBrands,
  getMaterialProperties,
  filterMaterials,
  sortMaterials,
  groupMaterialsByType,
  handleFiltersChange,
  handleSorterChange
} = useMaterialFilter()

const expandedRowKeys = ref<string[]>([])

const allMaterials = computed(() => props.materials?.getAll() ?? [])
const displayData = ref<Material[]>([])

const materialTypes = computed(() => getMaterialTypes(allMaterials.value))
const materialBrands = computed(() => getMaterialBrands(allMaterials.value))
const materialProperties = computed(() => getMaterialProperties(allMaterials.value))

// Вычисляем общий вес всех материалов
const totalWeight = computed(() => {
  if (!allMaterials.value.length) return 0
  return allMaterials.value.reduce((sum, material) => sum + (material.total_weight || 0), 0)
})

const filterData = () => {
  if (!props.materials) {
    displayData.value = []
    return
  }
  let filtered = [...allMaterials.value]
  // Гарантируем, что это экземпляры Material
  filtered = filtered.map(m => m instanceof Material ? m : new Material(m))
  if (props.enableFiltering || props.enableSearch) {
    filtered = filterMaterials(filtered)
  }
  if (props.enableSorting) {
    filtered = sortMaterials(filtered)
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

const handleMaterialUpdate = (material: Material, field: string, value: number) => {
  emit('update:material', material, field, value)
}

const selectedKeys = computed({
  get: () => (props.selectedRowKeys || []).map(String),
  set: (value) => emit('update:selectedRowKeys', value.map(String))
})

const getRowKey = (row: any) => {
  if (row.type === 'group') {
    // Для групп используем уникальный ключ
    return `group-${row.uuid || row.title || row.key}`
  }
  return row.uuid
}

const handleRowClick = (row: RowData) => {
  if (row.type === 'group') return

  console.log('Row clicked:', row)
  emit('row:click', row as Material)
}

watch(() => props.materials, filterData, {immediate: true})
watch(() => props.materials?.getAll(), filterData, {deep: true})
watch(() => filters.searchText, filterData)
watch(() => filters.quantityFrom, filterData)
watch(() => filters.quantityTo, filterData)
watch(() => filters.amountFrom, filterData)
watch(() => filters.amountTo, filterData)
watch(() => filters.weightFrom, filterData)
watch(() => filters.weightTo, filterData)

const groupedData = computed(() => {
  let data = props.enableGrouping ? groupMaterialsByType(displayData.value) : displayData.value

  // Добавляем итоговую строку как первую строку, если не скрыта
  if (!props.hideTotalWeight && allMaterials.value.length > 0) {
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
      title: props.enableGrouping ? 'Тип / Марка' : 'Марка',
      key: 'material_standard.material_brands.name',
      fixed: 'left' as const,
      filter: props.enableFiltering,
      filterOptions: props.enableFiltering ? materialBrands.value.map(brand => ({
        label: brand,
        value: brand
      })) : undefined,
      filterOptionValues: props.enableFiltering ? Array.from(filters.brandFilter) : undefined,
      sorter: props.enableSorting ? (a: RowData, b: RowData) => {
        const aBrands = a.material_standard?.material_brands?.getAll().map((brand: any) => brand.name).join(', ') || ''
        const bBrands = b.material_standard?.material_brands?.getAll().map((brand: any) => brand.name).join(', ') || ''
        return aBrands.localeCompare(bBrands)
      } : undefined,
      render(row: RowData) {
        if (row.type === 'total') {
          return h('span', {class: 'font-bold'}, 'ИТОГО')
        }
        if (props.enableGrouping && row.type === 'group') {
          return h('span', {class: 'font-bold'}, `${row.title} (${row.children.length})`)
        }
        if (!row.material_standard?.material_brands) return ''
        const brandsText = row.material_standard.material_brands.getAll().map((materialBrand: any) => materialBrand.name).join(', ')
        return h('span', {class: 'font-medium'}, brandsText)
      }
    },
    {
      title: 'Свойства',
      key: 'material_standard.material_properties.name',
      fixed: 'left' as const,
      filter: props.enableFiltering,
      filterOptions: props.enableFiltering ? materialProperties.value.map(prop => ({
        label: prop,
        value: prop
      })) : undefined,
      filterOptionValues: props.enableFiltering ? Array.from(filters.propertyFilter) : undefined,
      sorter: props.enableSorting ? (a: RowData, b: RowData) => {
        const aProps = a.material_standard?.material_properties?.getAll().map((prop: any) => prop.name).join(', ') || ''
        const bProps = b.material_standard?.material_properties?.getAll().map((prop: any) => prop.name).join(', ') || ''
        return aProps.localeCompare(bProps)
      } : undefined,
      render(row: RowData) {
        if (row.type === 'total') return ''
        if (props.enableGrouping && row.type === 'group') return ''
        if (!row.material_standard?.material_properties) return ''
        return row.material_standard.material_properties.getAll().map((materialProperty: any) => materialProperty.name).join(', ')
      }
    },
    {
      title: 'Объем',
      key: 'quantity',
      fixed: 'left' as const,
      sorter: props.enableSorting ? (a: RowData, b: RowData) => a.quantity - b.quantity : undefined,
      render(row: RowData) {
        if (row.type === 'total') return ''
        if (props.enableGrouping && row.type === 'group') {
          return h('span', {class: 'font-bold'}, `${row.groupQuantity.toFixed(2)} ${row.children[0]?.material_standard?.material_type?.material_unit?.label || ''}`)
        }
        if (props.enableEditing && row.type !== 'group') {
          return h(MaterialEditCell, {
            value: row.quantity,
            field: 'quantity',
            mode: props.editMode || 'edit',
            material: row as Material,
            onUpdateValue: (value: number) => handleMaterialUpdate(row as Material, 'quantity', value)
          })
        }
        if (props.showInitials && !row.isFixedQuantity) {
          if (row.isQuantityChanged()) {
            return h('div', {class: 'flex items-center gap-1'}, [
              h('span', {class: 'text-red-500'}, row.getDisplayInitialQuantity()),
              h('span', {class: 'text-gray-400'}, '→'),
              h('span', row.getDisplayQuantity())
            ])
          }
        }
        if (!row.material_standard?.material_type?.material_unit) return ''
        return row.getDisplayQuantity()
        // return `${material.quantity} ${material.material_standard.material_type.material_unit.label}`
      }
    },
    {
      title: 'Количество',
      key: 'amount',
      fixed: 'left' as const,
      sorter: props.enableSorting ? (a: RowData, b: RowData) => a.amount - b.amount : undefined,
      render(row: RowData) {
        if (row.type === 'total') return ''
        if (props.enableGrouping && row.type === 'group') {
          return h('span', {class: 'font-bold'}, `${row.groupAmount} шт.`)
        }
        if (props.enableEditing && row.type !== 'group') {
          return h(MaterialEditCell, {
            value: row.amount,
            field: 'amount',
            mode: props.editMode || 'edit',
            material: row as Material,
            onUpdateValue: (value: number) => handleMaterialUpdate(row as Material, 'amount', value)
          })
        }
        if (props.showInitials) {
          if (row.isAmountChanged()) {
            return h('div', {class: 'flex items-center gap-1'}, [
              h('span', {class: 'text-red-500'}, row.getDisplayInitialAmount()),
              h('span', {class: 'text-gray-400'}, '→'),
              h('span', row.getDisplayAmount())
            ])
          }
        }
        return row.getDisplayAmount()
        // return `${material.amount} шт.`
      }
    },
    {
      title: 'Вес',
      key: 'total_weight',
      fixed: 'left' as const,
      sorter: props.enableSorting ? (a: RowData, b: RowData) => a.total_weight - b.total_weight : undefined,
      render(row: RowData) {
        if (row.type === 'total') {
          return h('span', {class: 'font-bold'}, `${row.totalWeight.toFixed(2)} т.`)
        }
        if (props.enableGrouping && row.type === 'group') {
          return h('span', {class: 'font-bold'}, `${row.groupWeight.toFixed(2)} т.`)
        }

        if (props.showInitials) {
          if (row.isTotalWeightChanged()) {
            return h('div', {class: 'flex items-center gap-1'}, [
              h('span', {class: 'text-red-500'}, row.getDisplayInitialTotalWeight()),
              h('span', {class: 'text-gray-400'}, '→'),
              h('span', row.getDisplayTotalWeight())
            ])
          }
        }

        return row.getDisplayTotalWeight()
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
        const material = row as Material
        return h(
            NButton,
            {
              quaternary: true,
              type: 'error',
              class: 'delete-btn',
              onClick: (e: Event) => {
                e.stopPropagation()
                emit('delete:material', material)
              }
            },
            [h(NIcon, null, {default: () => h(Trash)})]
        )
      }
    })
  }

  if (props.enableChanging) {
    baseColumns.push({
      title: '',
      key: 'change',
      fixed: 'right' as const,
      width: 60,
      render(row: RowData) {
        if (row.type === 'total' || row.type === 'group') return ''
        const material = row as Material
        return h(
            NButton,
            {
              quaternary: true,
              class: 'delete-btn',
              onClick: (e: Event) => {
                e.stopPropagation()
                emit('change:material', material)
              }
            },
            [h(NIcon, null, {default: () => h(ExchangeAlt)})]
        )
      }
    })
  }

  return baseColumns
})

const tableContainerRef = ref()

// Убираем сложную логику вычисления высоты - используем CSS flexbox

const rowProps = (row: Material) => ({
  onClick: () => {
    emit('row:click', row.uuid)
  },
})

</script>

<template>
  <n-space
      v-if="enableSearch || enableNumericFilters"
      align="center"
      class="mb-4"
  >
    <n-input
        v-if="enableSearch"
        v-model:value="filters.searchText"
        placeholder="Поиск по типу, марке, свойствам..."
        clearable
        style="width: 300px"
    />
    <template v-if="enableNumericFilters">
      <n-input-number
          v-model:value="filters.quantityFrom"
          placeholder="Объем от"
          style="width: 100px"
      />
      <n-input-number
          v-model:value="filters.quantityTo"
          placeholder="Объем до"
          style="width: 100px"
      />
      <n-input-number
          v-model:value="filters.amountFrom"
          placeholder="Кол-во от"
          style="width: 100px"
      />
      <n-input-number
          v-model:value="filters.amountTo"
          placeholder="Кол-во до"
          style="width: 100px"
      />
      <n-input-number
          v-model:value="filters.weightFrom"
          placeholder="Вес от"
          style="width: 100px"
      />
      <n-input-number
          v-model:value="filters.weightTo"
          placeholder="Вес до"
          style="width: 100px"
      />
    </template>
    <div class="filter-info">
      Показано: {{ displayData.length }} из {{ allMaterials.length }} материалов
    </div>
  </n-space>
  <div class="flex flex-1 flex-col h-full">
    <div
        ref="tableContainerRef"
        class="flex-1 min-h-0 overflow-hidden"
    >
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
</template>

<style scoped>
</style>