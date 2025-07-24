<script
    setup
    lang="ts"
>
import type {MaterialStandardCollection} from "~/models/collections/MaterialStandardCollection";
import type {MaterialStandard} from "~/models/MaterialStandard";
import type {MaterialCollection} from "~/models/collections/MaterialCollection";
import {Ruler, Box, BalanceScale} from '@vicons/fa'
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
}>()

const props = defineProps<{
  materials: MaterialCollection
  enableContextMenu?: boolean
  contextMenuOptions?: ContextMenuOption[]
}>()

const search = ref('')
const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null)
const selectedMaterial = ref<Material | null>(null)

const filteredMaterials = computed<Material[]>(() => {
  const all = props.materials.getAll()

  if (!search.value.trim()) return all
  const q = search.value.trim().toLowerCase()
  return all.filter((material) => {
    const typeName = material.material_standard.material_type.name?.toLowerCase() || ''
    const brands = material.material_standard.material_brands.getAll().map((b: any) => b.name?.toLowerCase() || '').join(', ')
    const properties = material.material_standard.material_properties.getAll().map((p: any) => p.name?.toLowerCase() || '').join(', ')
    return typeName.includes(q) || brands.includes(q) || properties.includes(q)
  })
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
</script>

<template>
  <n-input
      v-model:value="search"
      placeholder="Поиск по типу, марке или свойству..."
  />
  <n-virtual-list
      :items="filteredMaterials"
      key-field="uuid"
      :item-size="79"
      class="flex-1"
  >
    <template #default="{ item, index }">
      <div
          class="p-1"
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
              <p class="font-bold">{{ item.getDisplayType() }}</p> |
              <p>{{ item.getDisplayBrands() }}</p>
            </div>
            <div class="flex gap-2 text-gray-500 text-sm">
              <p>{{ item.getDisplayProperties() }}</p>
            </div>
          </div>

          <div class="flex gap-2 mt-2">
            <p class="flex items-center gap-2">
              <n-icon class="text-gray-500">
                <Ruler/>
              </n-icon>
              {{ item.getDisplayQuantity() }}
            </p>
            <p class="flex items-center gap-2">
              <n-icon class="text-gray-500">
                <Box/>
              </n-icon>
              {{ item.getDisplayAmount() }}
            </p>
            <p class="flex items-center gap-2">
              <n-icon class="text-gray-500">
                <BalanceScale/>
              </n-icon>
              {{ item.getDisplayTotalWeight() }}
            </p>
          </div>

        </div>
      </div>

    </template>
  </n-virtual-list>

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