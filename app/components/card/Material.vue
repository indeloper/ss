<script
    setup
    lang="ts"
>
import type {Material} from "~/models/Material";
import {Ruler, Box, BalanceScale} from '@vicons/fa'
import {computed} from 'vue'

interface Props {
  material: Material
  disabled?: boolean
  type?: 'success' | 'error' | 'warn' | 'info'
  tooltip?: (material: Material) => string,
  markChanged?: boolean
}

const props = defineProps<Props>()

const computedTooltip = computed(() => {
  return props.tooltip ? props.tooltip(props.material) : undefined
})
</script>

<template>
  <n-tooltip
      :disabled="!computedTooltip"
      trigger="hover"
  >
    <template #trigger>
      <div
          class="rounded-md border border-gray-300 p-2 font-lg cursor-pointer transition-all"
          :class="{
          'hover:bg-gray-100 hover:scale-[101%] active:scale-[99%]': !props.disabled,
          'opacity-50': props.disabled,
          'border-green-500 bg-green-50': props.type === 'success',
          'border-red-500 bg-red-50': props.type === 'error',
          'border-yellow-500 bg-yellow-50': props.type === 'warn',
          'border-blue-500 bg-blue-50': props.type === 'info'
        }"
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
                  :class="{'text-red-700': props.markChanged && material.isQuantityChanged, 'text-gray-500': !props.markChanged}"
              >
                <n-icon>
                  <Ruler/>
                </n-icon>
                {{ material.getDisplayQuantity() }}
              </p>
              <p
                  class="flex items-center gap-2"
                  :class="{'text-red-700': props.markChanged && material.isAmountChanged, 'text-gray-500': !props.markChanged}"
              >
                <n-icon>
                  <Box/>
                </n-icon>
                {{ material.getDisplayAmount() }}
              </p>
              <p
                  class="flex items-center gap-2"
                  :class="{'text-red-700': props.markChanged && material.isTotalWeightChanged, 'text-gray-500': !props.markChanged}"
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
</template>
