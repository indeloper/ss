<script
    setup
    lang="ts"
>
import {ref} from 'vue'

const props = defineProps<{
  title: string
  placeholder?: string
  canDrop?: (event: DragEvent) => boolean
  enableDrop?: boolean
}>()

const emit = defineEmits<{
  (e: 'drop', event: DragEvent): void
  (e: 'dragover', event: DragEvent): void
}>()

const isDragOver = ref(false)
const canDropItem = ref(true)

const handleDrop = (event: DragEvent) => {
  if (!props.enableDrop) return

  event.preventDefault()
  isDragOver.value = false
  emit('drop', event)
}

const handleDragOver = (event: DragEvent) => {
  if (!props.enableDrop) return

  event.preventDefault()

  if (props.canDrop) {
    canDropItem.value = props.canDrop(event)
    event.dataTransfer!.dropEffect = canDropItem.value ? 'move' : 'none'
  } else {
    canDropItem.value = true
    event.dataTransfer!.dropEffect = 'move'
  }

  emit('dragover', event)
}

const handleDragEnter = (event: DragEvent) => {
  if (!props.enableDrop) return

  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  if (!props.enableDrop) return

  event.preventDefault()
  // Проверяем, что мы действительно покинули элемент
  if (!event.currentTarget?.contains(event.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

</script>

<template>
  <div
      class="bg-white rounded shadow flex flex-col gap-2 overflow-hidden p-4 transition-all"
      :class="{
        'border-2 border-dashed': isDragOver,
        'border-green-500 bg-green-50': isDragOver && canDropItem,
        'border-red-500 bg-red-50': isDragOver && !canDropItem
      }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
  >
    <div
        v-if="title || $slots.actions"
        class="flex justify-between items-center w-full flex-shrink-0"
    >
      <p
          v-if="title"
          class="font-bold text-lg"
      >{{ title }}</p>
      <div
          class="flex gap-2"
          v-if="$slots.actions"
      >
        <slot name="actions"/>
      </div>
    </div>
    <div class="flex-1 flex-col flex overflow-hidden">
      <slot/>
    </div>
    <!--    <p class="font-bold text-lg">{{ title }}</p>-->
    <!--    -->
    <!--    <div v-if="isDragOver && placeholder" class="flex-1 flex items-center justify-center">-->
    <!--      <p class="text-center text-gray-500 text-lg">{{ placeholder }}</p>-->
    <!--    </div>-->
    <!--    -->
    <!--    <div v-else class="flex-1 overflow-hidden flex flex-col">-->
    <!--      &lt;!&ndash; Основное содержимое или empty слот &ndash;&gt;-->
    <!--      <div class="flex-1 overflow-hidden flex flex-col">-->
    <!--        <slot name="empty" v-if="$slots.empty && !$slots.default">-->
    <!--          &lt;!&ndash; Показываем empty слот если он есть и нет основного контента &ndash;&gt;-->
    <!--        </slot>-->
    <!--        <template v-else>-->
    <!--          <div class="flex-1 overflow-hidden">-->
    <!--            <slot></slot>-->
    <!--          </div>-->
    <!--        </template>-->
    <!--      </div>-->
    <!--      -->
    <div
        v-if="$slots.footer"
        class="mt-auto pt-2"
    >
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style scoped>
.border-green-500 {
  border-color: var(--color-green);
}

.bg-green-50 {
  background-color: color-mix(in srgb, var(--color-green) 10%, white);
}
</style>