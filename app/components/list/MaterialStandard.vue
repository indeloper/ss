<script
    setup
    lang="ts"
>
import type {MaterialStandardCollection} from "~/models/collections/MaterialStandardCollection";
import type {MaterialStandard} from "~/models/MaterialStandard";
import ContextMenu from "~/components/util/ContextMenu.vue";
import {Filter} from '@vicons/fa'

interface ContextMenuOption {
  label: string
  key: string
  action: (standard: MaterialStandard) => void
  disabled?: boolean | ((standard: MaterialStandard) => boolean)
  type?: 'divider'
}

const emit = defineEmits<{
  (e: 'itemClick', uuid: string): void
  (e: 'itemDoubleClick', uuid: string): void
}>()

const props = defineProps<{
  materialStandards: MaterialStandardCollection
  enableContextMenu?: boolean
  contextMenuOptions?: ContextMenuOption[]
  enableSearch?: boolean
  itemDisabled?: (item: MaterialStandard) => boolean
  enableSelection?: boolean
  selectionMode?: 'single' | 'multiple'
}>()

const selection = defineModel<string | string[]>('selection', { default: () => [] })

const search = ref('')
const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null)
const selectedStandard = ref<MaterialStandard | null>(null)
const clickTimeout = ref<number | null>(null)

// Фильтры
const selectedMaterialTypeIds = ref<number[]>([])
const selectedMaterialBrandIds = ref<number[]>([])
const selectedMaterialPropertyIds = ref<number[]>([])

// Поиск внутри фильтров
const typeSearchQuery = ref('')
const brandSearchQuery = ref('')
const propertySearchQuery = ref('')

// Получаем уникальные типы материалов для фильтра
const materialTypeOptions = computed(() => {
  const options = props.materialStandards.getUniqueMaterialTypes()
  if (!typeSearchQuery.value.trim()) return options
  const query = typeSearchQuery.value.trim().toLowerCase()
  return options.filter(option => option.value.toLowerCase().includes(query))
})

// Получаем уникальные марки материалов для фильтра с учетом выбранных типов
const materialBrandOptions = computed(() => {
  let filteredCollection = props.materialStandards

  // Если выбраны типы, фильтруем коллекцию по типам
  if (selectedMaterialTypeIds.value.length > 0) {
    filteredCollection = filteredCollection.filterByMaterialTypeIds(selectedMaterialTypeIds.value)
  }

  const options = filteredCollection.getUniqueMaterialBrands()
  if (!brandSearchQuery.value.trim()) return options
  const query = brandSearchQuery.value.trim().toLowerCase()
  return options.filter(option => option.value.toLowerCase().includes(query))
})

// Получаем уникальные свойства материалов для фильтра с учетом выбранных типов и марок
const materialPropertyOptions = computed(() => {
  let filteredCollection = props.materialStandards

  // Если выбраны типы, фильтруем коллекцию по типам
  if (selectedMaterialTypeIds.value.length > 0) {
    filteredCollection = filteredCollection.filterByMaterialTypeIds(selectedMaterialTypeIds.value)
  }

  // Если выбраны марки, фильтруем коллекцию по маркам
  if (selectedMaterialBrandIds.value.length > 0) {
    filteredCollection = filteredCollection.filterByMaterialBrandIds(selectedMaterialBrandIds.value)
  }

  const options = filteredCollection.getUniqueMaterialProperties()
  if (!propertySearchQuery.value.trim()) return options
  const query = propertySearchQuery.value.trim().toLowerCase()
  return options.filter(option => option.value.toLowerCase().includes(query))
})

const filteredMaterialStandards = computed<MaterialStandard[]>(() => {
  let filtered = props.materialStandards

  // Применяем фильтр по типам материалов
  if (selectedMaterialTypeIds.value.length > 0) {
    filtered = filtered.filterByMaterialTypeIds(selectedMaterialTypeIds.value)
  }

  // Применяем фильтр по маркам материалов
  if (selectedMaterialBrandIds.value.length > 0) {
    filtered = filtered.filterByMaterialBrandIds(selectedMaterialBrandIds.value)
  }

  // Применяем фильтр по свойствам материалов
  if (selectedMaterialPropertyIds.value.length > 0) {
    filtered = filtered.filterByMaterialPropertyIds(selectedMaterialPropertyIds.value)
  }

  const all = filtered.getAll()

  if (!search.value.trim()) return all
  const q = search.value.trim().toLowerCase()
  return all.filter((standard) => {
    const typeName = standard.material_type.name?.toLowerCase() || ''
    const brands = standard.material_brands.getAll().map((b: any) => b.name?.toLowerCase() || '').join(', ')
    const properties = standard.material_properties.getAll().map((p: any) => p.name?.toLowerCase() || '').join(', ')
    return typeName.includes(q) || brands.includes(q) || properties.includes(q)
  })
})

// Преобразуем опции контекстного меню для ContextMenu компонента
const contextMenuOptionsForComponent = computed(() => {
  if (!props.contextMenuOptions || !selectedStandard.value) return []

  return props.contextMenuOptions.map(option => ({
    label: option.label,
    key: option.key,
    disabled: typeof option.disabled === 'function'
        ? option.disabled(selectedStandard.value)
        : option.disabled || false,
    type: option.type
  }))
})

// Обработчик правого клика
const handleContextMenu = (event: MouseEvent, standard: MaterialStandard) => {
  if (!props.enableContextMenu || !props.contextMenuOptions?.length || props.itemDisabled?.(standard)) return

  event.preventDefault()
  selectedStandard.value = standard
  contextMenuRef.value?.show(event)
}

// Обработчик выбора пункта меню
const handleMenuSelect = (key: string | number) => {
  if (!selectedStandard.value) return

  const option = props.contextMenuOptions?.find(opt => opt.key === key)
  if (option?.action) {
    option.action(selectedStandard.value)
  }

  selectedStandard.value = null
}

// Обработчик клика вне меню
const handleClickOutside = () => {
  selectedStandard.value = null
}

const handleItemClick = (uuid: string, item: MaterialStandard) => {
  if (props.itemDisabled?.(item)) return

  // Обработка выбора элемента
  if (props.enableSelection) {
    const mode = props.selectionMode || 'single'
    
    if (mode === 'single') {
      // Для одиночного выбора
      if (Array.isArray(selection.value)) {
        selection.value = uuid
      } else {
        selection.value = selection.value === uuid ? '' : uuid
      }
    } else {
      // Для множественного выбора
      if (!Array.isArray(selection.value)) {
        selection.value = selection.value ? [selection.value, uuid] : [uuid]
      } else {
        if (selection.value.includes(uuid)) {
          // Удаляем из выбора
          selection.value = selection.value.filter(id => id !== uuid)
        } else {
          // Добавляем в выбор
          selection.value = [...selection.value, uuid]
        }
      }
    }
  }

  if (clickTimeout.value) {
    clearTimeout(clickTimeout.value)
    emit('itemDoubleClick', uuid)
    clickTimeout.value = null
  } else {
    clickTimeout.value = setTimeout(() => {
      clickTimeout.value = null
      emit('itemClick', uuid)
    }, 500)
  }
}

// Сброс фильтра марок при изменении типов
watch(selectedMaterialTypeIds, () => {
  selectedMaterialBrandIds.value = []
  selectedMaterialPropertyIds.value = []
})

// Сброс фильтра свойств при изменении марок
watch(selectedMaterialBrandIds, () => {
  selectedMaterialPropertyIds.value = []
})

// Количество активных фильтров
const activeFiltersCount = computed(() => {
  return selectedMaterialTypeIds.value.length +
      selectedMaterialBrandIds.value.length +
      selectedMaterialPropertyIds.value.length
})

// Сброс всех фильтров
const resetAllFilters = () => {
  selectedMaterialTypeIds.value = []
  selectedMaterialBrandIds.value = []
  selectedMaterialPropertyIds.value = []
  typeSearchQuery.value = ''
  brandSearchQuery.value = ''
  propertySearchQuery.value = ''
}

// Проверка, выбран ли элемент
const isItemSelected = (uuid: string): boolean => {
  if (!props.enableSelection) return false
  
  if (Array.isArray(selection.value)) {
    return selection.value.includes(uuid)
  } else {
    return selection.value === uuid
  }
}
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <div
        v-if="props.enableSearch === true"
        class="flex gap-2 mb-2 p-2"
    >
      <n-input
          v-model:value="search"
          placeholder="Поиск по типу, марке или свойству..."
      />
      <n-popover
          trigger="click"
          placement="bottom-start"
      >
        <template #trigger>
          <n-badge :value="activeFiltersCount > 0 ? activeFiltersCount : null">
            <n-button>
              <n-icon>
                <Filter/>
              </n-icon>
            </n-button>
          </n-badge>
        </template>
        <div class="p-2">
          <div class="grid grid-cols-3 gap-2">
            <div>
              <p class="font-semibold mb-2">Фильтр по типу материала:</p>
              <n-input
                  v-model:value="typeSearchQuery"
                  placeholder="Поиск по типу материала..."
              />
              <n-checkbox-group v-model:value="selectedMaterialTypeIds">
                <div class="flex flex-col gap-1">
                  <n-checkbox
                      v-for="option in materialTypeOptions"
                      :key="option.key"
                      :value="option.key"
                  >
                    {{ option.value }}
                  </n-checkbox>
                </div>
              </n-checkbox-group>
            </div>
            <div>
              <p class="font-semibold mb-2">Фильтр по марке материала:</p>
              <n-input
                  v-model:value="brandSearchQuery"
                  placeholder="Поиск по марке материала..."
              />
              <n-checkbox-group
                  v-model:value="selectedMaterialBrandIds"
                  class="!min-w-[300px]"
              >
                <n-virtual-list
                    style="max-height: 500px"
                    :item-size="32"
                    :items="materialBrandOptions"
                >
                  <template #default="{ item }">
                    <div
                        :key="item.key"
                        style="height: 32px"
                        class="flex items-center"
                    >
                      <n-checkbox :value="item.key">
                        {{ item.value }}
                      </n-checkbox>
                    </div>
                  </template>
                </n-virtual-list>
              </n-checkbox-group>
            </div>
            <div>
              <p class="font-semibold mb-2">Фильтр по свойству материала:</p>
              <n-input
                  v-model:value="propertySearchQuery"
                  placeholder="Поиск по свойству материала..."
              />
              <n-checkbox-group v-model:value="selectedMaterialPropertyIds">
                <div class="flex flex-col gap-1">
                  <n-checkbox
                      v-for="option in materialPropertyOptions"
                      :key="option.key"
                      :value="option.key"
                  >
                    {{ option.value }}
                  </n-checkbox>
                </div>
              </n-checkbox-group>
            </div>
          </div>
          <div class="flex justify-end mt-4 pt-2 border-t">
            <n-button
                type="primary"
                @click="resetAllFilters"
                :disabled="activeFiltersCount === 0"
            >
              Сбросить все фильтры
            </n-button>
          </div>
        </div>
      </n-popover>
    </div>

    <n-input
        v-else-if="props.enableSearch === true"
        v-model:value="search"
        placeholder="Поиск по типу, марке или свойству..."
    />
    <n-virtual-list
        :items="filteredMaterialStandards"
        key-field="uuid"
        :item-size="49"
        class="flex-1"
    >
      <template #default="{ item, index }">
        <div
            class="p-1"
            @click="handleItemClick(item.uuid, item)"
            @contextmenu="handleContextMenu($event, item)"
            :draggable="true"
            :class="{'opacity-50 pointer-events-none': props.itemDisabled?.(item)}"
        >
          <CardMaterialStandard
              :key="item.uuid"
              :material-standard="item"
              :disabled="props.itemDisabled?.(item)"
              :type="isItemSelected(item.uuid) ? 'info' : undefined"
              v-bind="$attrs"
          >
            <template v-for="(_, slot) in $slots" :key="slot" #[slot]="props">
              <slot :name="slot" :props="props" />
            </template>
          </CardMaterialStandard>
        </div>
      </template>
    </n-virtual-list>
  </div>

  <ContextMenu
      ref="contextMenuRef"
      :options="contextMenuOptionsForComponent"
      @select="handleMenuSelect"
      @outside-click="handleClickOutside"
  />
</template>

<style scoped>

</style>