<script
    setup
    lang="ts"
>
import type {Material} from "~/models/Material";
import {Ruler, Box, BalanceScale} from '@vicons/fa'
import {computed} from 'vue'
import ContextMenu from "~/components/util/ContextMenu.vue";

interface ContextMenuOption {
  label: string
  key: string
  action: (material: Material) => void
  disabled?: boolean | ((material: Material) => boolean)
  type?: 'divider'
}

interface Props {
  material: Material
  disabled?: boolean
  tooltip?: (material: Material) => string,
  type?: (material: Material) => 'success' | 'error' | 'warn' | 'info',
  markChanged?: boolean
  enableContextMenu?: boolean
  contextMenuOptions?: ContextMenuOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'contextmenu', event: MouseEvent, material: Material): void
  (e: 'click', materialUuid: string): void
}>()

const computedTooltip = computed(() => {
  return props.tooltip ? props.tooltip(props.material) : undefined
})

const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null)
const selectedMaterial = ref<Material | null>(null)
const handleContextMenu = (event: MouseEvent) => {
  if (!props.enableContextMenu || !props.contextMenuOptions?.length) return

  event.preventDefault()
  selectedMaterial.value = props.material
  contextMenuRef.value?.show(event)
}

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
  <n-tooltip
      :disabled="!computedTooltip"
      trigger="hover"
  >
    <template #trigger>
      <div
          class="rounded-md border border-gray-300 p-2 w-full font-lg cursor-pointer transition-all"
          :class="{
          'hover:bg-gray-100 hover:scale-[101%] active:scale-[99%]': !props.disabled,
          'opacity-50': props.disabled,
          'border-green-500 bg-green-50': props.type === 'success',
          'border-red-500 bg-red-50': props.type === 'error',
          'border-yellow-500 bg-yellow-50': props.type === 'warn',
          'border-blue-500 bg-blue-50': props.type === 'info'
        }"
          @contextmenu="handleContextMenu"
          @click="$emit('click', material.uuid)"
      >
        <div class="flex justify-between items-center">
          <div class="flex-1">
            <div class="flex justify-between items-center">
              <div class="flex gap-2">
                <p class="font-bold">{{ material.getDisplayType() }}</p> |
                <p>{{ material.getDisplayBrands() }}</p>
              </div>
              <div class="flex gap-2 text-gray-500 text-sm">
                <p>{{ material.getDisplayProperties() }}</p>
              </div>
            </div>

            <div class="flex gap-2 mt-2">
              <p
                  class="flex items-center gap-2"
              >
                <n-icon>
                  <Ruler/>
                </n-icon>
                {{ material.getDisplayQuantity() }}
                <span
                    v-if="props.markChanged && material.isQuantityChanged"
                    class="text-red-700"
                >
                  {{ material.getDisplayInitialQuantity() }}
                </span>
              </p>
              <p
                  class="flex items-center gap-2"
              >
                <n-icon>
                  <Box/>
                </n-icon>
                {{ material.getDisplayAmount() }}
                <span
                    v-if="props.markChanged && material.isAmountChanged"
                    class="text-red-700 line-through"
                >
                  {{ material.getDisplayInitialAmount() }}
                </span>
              </p>
              <p
                  class="flex items-center gap-2"
              >
                <n-icon>
                  <BalanceScale/>
                </n-icon>
                {{ material.getDisplayTotalWeight() }}
              </p>
            </div>
          </div>
          <template v-if="$slots.action">
            <div class="flex items-center justify-center ml-2 border-l border-gray-300 p-1">
              <slot
                  name="action"
                  :item="material"
              />
            </div>
          </template>

        </div>
      </div>
    </template>
    <span>{{ computedTooltip }}</span>
  </n-tooltip>

  <ContextMenu
      v-if="enableContextMenu && contextMenuOptions?.length"
      ref="contextMenuRef"
      :options="contextMenuOptionsForComponent"
      @select="handleMenuSelect"
      @clickoutside="handleClickOutside"
  />
</template>
