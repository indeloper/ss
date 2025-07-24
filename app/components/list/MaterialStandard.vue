<script
    setup
    lang="ts"
>
import type {MaterialStandardCollection} from "~/models/collections/MaterialStandardCollection";
import type {MaterialStandard} from "~/models/MaterialStandard";
import ContextMenu from "~/components/util/ContextMenu.vue";

interface ContextMenuOption {
  label: string
  key: string
  action: (standard: MaterialStandard) => void
  disabled?: boolean | ((standard: MaterialStandard) => boolean)
  type?: 'divider'
}

const emit = defineEmits<{
  (e: 'itemClick', uuid: string): void
}>()

const props = defineProps<{
  materialStandards: MaterialStandardCollection
  enableContextMenu?: boolean
  contextMenuOptions?: ContextMenuOption[]
}>()

const search = ref('')
const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null)
const selectedStandard = ref<MaterialStandard | null>(null)

const filteredMaterialStandards = computed<MaterialStandard[]>(() => {
  const all = props.materialStandards.getAll()

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
  if (!props.enableContextMenu || !props.contextMenuOptions?.length) return

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
</script>

<template>
  <n-input
      v-model:value="search"
      placeholder="Поиск по типу, марке или свойству..."
  />
  <n-virtual-list
      :items="filteredMaterialStandards"
      key-field="uuid"
      :item-size="41"
      class="flex-1"
  >
    <template #default="{ item, index }">
      <div
          class="p-1 pb-4"
          @click="emit('itemClick', item.uuid)"
          @contextmenu="handleContextMenu($event, item)"
          :draggable="true"
      >
        <div
            :key="item.uuid"
            class="rounded-md border border-gray-300 p-2 font-lg hover:bg-gray-100 cursor-pointer transition-all hover:scale-[101%] active:scale-[99%]"
        >
          <div class="flex justify-between items-center">
            <div class="flex gap-2">
              <p class="font-bold">{{ item.material_type.name }}</p> |
              <p>{{ item.material_brands.getAll().map(b => b.name).join(', ') }}</p>
            </div>
            <div class="flex gap-2 text-gray-500 text-sm">
              <p>{{ item.material_properties.getAll().map(p => p.name).join(', ') }}</p>
            </div>
          </div>
        </div>
      </div>

    </template>
  </n-virtual-list>
  <ContextMenu
    ref="contextMenuRef"
    :options="contextMenuOptionsForComponent"
    @select="handleMenuSelect"
    @outside-click="handleClickOutside"
  />
</template>

<style scoped>

</style>