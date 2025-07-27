<script setup lang="ts">
import type { MaterialStandard } from "~/models/MaterialStandard";

interface Props {
  materialStandard: MaterialStandard
  disabled?: boolean
  type?: 'success' | 'error' | 'warn' | 'info'
}

const props = defineProps<Props>()
</script>

<template>
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
            <p class="font-bold">{{ materialStandard.material_type.name }}</p> |
            <p>{{ materialStandard.material_brands.getAll().map(b => b.name).join(', ') }}</p>
          </div>
          <div class="flex gap-2 text-gray-500 text-sm">
            <p>{{ materialStandard.material_properties.getAll().map(p => p.name).join(', ') }}</p>
          </div>
        </div>
      </div>
      
      <div v-if="$slots.action" class="flex items-center justify-center ml-2">
        <slot name="action" />
      </div>
    </div>
  </div>
</template>
