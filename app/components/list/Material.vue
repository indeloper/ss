<script
    setup
    lang="ts"
>
import type {MaterialStandardCollection} from "~/models/collections/MaterialStandardCollection";
import type {MaterialStandard} from "~/models/MaterialStandard";
import type {MaterialCollection} from "~/models/collections/MaterialCollection";
import {Ruler, Box, BalanceScale, Filter} from '@vicons/fa'
import type {Material} from "~/models/Material";
import ContextMenu from "~/components/util/ContextMenu.vue";

interface ContextMenuOption {
  label: string
  key: string
  action: (material: Material) => void
  disabled?: boolean | ((material: Material) => boolean)
  type?: 'divider'
}

const emit = defineEmits<{
  (e: 'itemClick', uuid: string): void
  (e: 'itemDoubleClick', uuid: string): void
  (e: 'itemDragStart', event: DragEvent, uuid: string): void
}>()

const props = defineProps<{
  materials: MaterialCollection
  enableContextMenu?: boolean
  contextMenuOptions?: ContextMenuOption[]
  enableSearch?: boolean
  enableDraggable?: boolean
  itemDisabled?: (item: Material) => boolean
  enableSelection?: boolean
  selectionMode?: 'single' | 'multiple'
  itemTooltip?: (item: Material) => string,
  markChanged?: boolean
}>()

const selection = defineModel<string | string[]>('selection', {default: () => []})

const search = ref('')
const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null)
const selectedMaterial = ref<Material | null>(null)
const clickTimeout = ref<number | null>(null)

// Фильтры
const selectedMaterialTypeIds = ref<number[]>([])
const selectedMaterialBrandIds = ref<number[]>([])
const selectedMaterialPropertyIds = ref<number[]>([])

// Поиск внутри фильтров
const typeSearchQuery = ref('')
const brandSearchQuery = ref('')
const propertySearchQuery = ref('')

// Числовые фильтры
const minQuantity = ref<number | null>(null)
const maxQuantity = ref<number | null>(null)
const minAmount = ref<number | null>(null)
const maxAmount = ref<number | null>(null)
const minTotalWeight = ref<number | null>(null)
const maxTotalWeight = ref<number | null>(null)

// Получаем уникальные типы материалов для фильтра
const materialTypeOptions = computed(() => {
  const options = props.materials.getUniqueMaterialTypes()
  if (!typeSearchQuery.value.trim()) return options
  const query = typeSearchQuery.value.trim().toLowerCase()
  return options.filter(option => option.value.toLowerCase().includes(query))
})

// Получаем уникальные марки материалов для фильтра с учетом выбранных типов
const materialBrandOptions = computed(() => {
  let filteredCollection = props.materials

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
  let filteredCollection = props.materials

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

const filteredMaterials = computed<Material[]>(() => {
  let filtered = props.materials

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

  let all = filtered.getAll()

  // Применяем числовые фильтры
  if (minQuantity.value !== null || maxQuantity.value !== null ||
      minAmount.value !== null || maxAmount.value !== null ||
      minTotalWeight.value !== null || maxTotalWeight.value !== null) {

    all = all.filter(material => {
      const quantity = material.quantity
      const amount = material.amount
      const totalWeight = material.total_weight

      // Фильтр по количеству
      if (minQuantity.value !== null && quantity < minQuantity.value) return false
      if (maxQuantity.value !== null && quantity > maxQuantity.value) return false

      // Фильтр по объему
      if (minAmount.value !== null && amount < minAmount.value) return false
      if (maxAmount.value !== null && amount > maxAmount.value) return false

      // Фильтр по общему весу
      if (minTotalWeight.value !== null && totalWeight < minTotalWeight.value) return false
      if (maxTotalWeight.value !== null && totalWeight > maxTotalWeight.value) return false

      return true
    })
  }

  if (!search.value.trim()) return all
  const q = search.value.trim().toLowerCase()
  return all.filter((material) => {
    const typeName = material.material_standard.material_type.name?.toLowerCase() || ''
    const brands = material.material_standard.material_brands.getAll().map((b: any) => b.name?.toLowerCase() || '').join(', ')
    const properties = material.material_standard.material_properties.getAll().map((p: any) => p.name?.toLowerCase() || '').join(', ')
    return typeName.includes(q) || brands.includes(q) || properties.includes(q)
  })
})

// Количество активных фильтров
const activeFiltersCount = computed(() => {
  const categoryFilters = selectedMaterialTypeIds.value.length +
      selectedMaterialBrandIds.value.length +
      selectedMaterialPropertyIds.value.length

  const numericFilters = [minQuantity.value, maxQuantity.value, minAmount.value,
    maxAmount.value, minTotalWeight.value, maxTotalWeight.value]
      .filter(val => val !== null).length

  return categoryFilters + numericFilters
})

// Сброс всех фильтров
const resetAllFilters = () => {
  selectedMaterialTypeIds.value = []
  selectedMaterialBrandIds.value = []
  selectedMaterialPropertyIds.value = []
  typeSearchQuery.value = ''
  brandSearchQuery.value = ''
  propertySearchQuery.value = ''
  minQuantity.value = null
  maxQuantity.value = null
  minAmount.value = null
  maxAmount.value = null
  minTotalWeight.value = null
  maxTotalWeight.value = null
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

// Преобразуем опции контекстного меню для ContextMenu компонента
const contextMenuOptionsForComponent = computed(() => {
  if (!props.contextMenuOptions || !selectedMaterial.value) return []

  return props.contextMenuOptions.map(option => ({
    label: option.label,
    key: option.key,
    disabled: typeof option.disabled === 'function'
        ? option.disabled(selectedMaterial.value)
        : option.disabled || false,
    type: option.type
  }))
})

// Обработчик правого клика
const handleContextMenu = (event: MouseEvent, material: Material) => {
  if (!props.enableContextMenu || !props.contextMenuOptions?.length) return

  event.preventDefault()
  selectedMaterial.value = material
  contextMenuRef.value?.show(event)
}

// Обработчик выбора пункта меню
const handleMenuSelect = (key: string | number) => {
  if (!selectedMaterial.value) return

  const option = props.contextMenuOptions?.find(opt => opt.key === key)
  if (option?.action) {
    option.action(selectedMaterial.value)
  }

  selectedMaterial.value = null
}

// Обработчик клика вне меню
const handleClickOutside = () => {
  selectedMaterial.value = null
}

// Обработчик клика на элементе
const handleClick = (uuid: string, item: Material) => {
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
    clickTimeout.value = null
    emit('itemDoubleClick', uuid)
  } else {
    clickTimeout.value = setTimeout(() => {
      clickTimeout.value = null
      emit('itemClick', uuid)
    }, 300)
  }
}

const handleDragStart = (event: DragEvent, uuid: string, item: Material) => {
  if (!props.enableDraggable || props.itemDisabled?.(item)) return

  event.dataTransfer?.setData('text/plain', uuid)

  emit('itemDragStart', event, uuid)
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
          class="flex-1"
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
          <div class="grid grid-cols-4 gap-2 mb-4">
            <div class="grid grid-cols-1 gap-2">
              <div>
                <p class="font-semibold mb-2">Фильтр по количеству:</p>
                <div class="flex flex-col gap-2">
                  <n-input-number
                      v-model:value="minQuantity"
                      placeholder="Мин."
                      class="flex-1"
                      :min="0"
                  />
                  <n-input-number
                      v-model:value="maxQuantity"
                      placeholder="Макс."
                      class="flex-1"
                      :min="0"
                  />
                </div>
              </div>
              <div>
                <p class="font-semibold mb-2">Фильтр по объему:</p>
                <div class="flex flex-col gap-2">
                  <n-input-number
                      v-model:value="minAmount"
                      placeholder="Мин."
                      class="flex-1"
                      :min="0"
                  />
                  <n-input-number
                      v-model:value="maxAmount"
                      placeholder="Макс."
                      class="flex-1"
                      :min="0"
                  />
                </div>
              </div>
              <div>
                <p class="font-semibold mb-2">Фильтр по общему весу:</p>
                <div class="flex flex-col gap-2">
                  <n-input-number
                      v-model:value="minTotalWeight"
                      placeholder="Мин."
                      class="flex-1"
                      :min="0"
                  />
                  <n-input-number
                      v-model:value="maxTotalWeight"
                      placeholder="Макс."
                      class="flex-1"
                      :min="0"
                  />
                </div>
              </div>
            </div>
            <div>
              <p class="font-semibold mb-2">Фильтр по типу материала:</p>
              <n-input
                  v-model:value="typeSearchQuery"
                  placeholder="Поиск по типу материала..."
                  class="mb-2"
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
                  class="mb-2"
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
                  class="mb-2"
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

          <n-divider/>

          <div class="flex justify-end mt-4 pt-2">
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
        :items="filteredMaterials"
        key-field="uuid"
        :item-size="79"
        class="flex-1 transition-all"
    >
      <template #default="{ item, index }">
        <div
            class="p-1"
            @click="handleClick(item.uuid, item)"
            @contextmenu="handleContextMenu($event, item)"
            :draggable="props.enableDraggable"
            @dragstart="handleDragStart($event, item.uuid, item)"
        >
          <CardMaterial
              :key="item.uuid"
              :material="item"
              :disabled="props.itemDisabled?.(item)"
              :type="isItemSelected(item.uuid) ? 'info' : undefined"
              :tooltip="props.itemTooltip"
              v-bind="$attrs"
              :mark-changed="markChanged"
          >
            <template #action="{item}">
              <slot
                  name="item-action"
                  :item="item"
              />
            </template>

            <!--            <template v-for="(slot, name) in $slots" :key="name" #[name]="slotProps">-->
            <!--              <slot :name="name" v-bind="slotProps" />-->
            <!--            </template>-->
          </CardMaterial>
        </div>
      </template>
    </n-virtual-list>
  </div>


  <!-- Контекстное меню -->
  <ContextMenu
      v-if="enableContextMenu && contextMenuOptions?.length"
      ref="contextMenuRef"
      :options="contextMenuOptionsForComponent"
      @select="handleMenuSelect"
      @clickoutside="handleClickOutside"
  />
</template>

<style scoped>

</style>