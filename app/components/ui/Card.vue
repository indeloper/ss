<script
    setup
    lang="ts"
>
import {ref} from 'vue'
import {InfoCircle} from '@vicons/fa'
import {useDocumentationStore} from "~/stores/documentation";
import {EllipsisV} from '@vicons/fa'
import type {Material} from "~/models/Material";

interface ContextMenuOption {
  label: string
  key: string
  action: () => void
  disabled?: boolean | (() => boolean)
  type?: 'divider'
}

const props = defineProps<{
  title: string
  placeholder?: string
  canDrop?: (event: DragEvent) => boolean
  enableDrop?: boolean,
  documentationKey?: string,
  enableContextMenu?: boolean,
  contextMenuOptions?: ContextMenuOption[],
}>()

const emit = defineEmits<{
  (e: 'drop', event: DragEvent): void
  (e: 'dragover', event: DragEvent): void
}>()

const documentationStore = useDocumentationStore()

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


const handleShowDocumentation = () => {
  if (props.documentationKey) {
    documentationStore.show(props.documentationKey)
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
          class="font-bold text-lg flex gap-2 items-center"
          v-show="!isDragOver"
      >{{ title }}
        <n-icon
            v-if="documentationKey"
            class="transition-all hover:scale-[125%]  active:scale-[95%] cursor-pointer"
            @click="handleShowDocumentation"
        >
          <InfoCircle/>
        </n-icon>
      </p>
      <div class="flex gap-2">
        <template v-if="$slots.actions">
          <slot name="actions"/>
        </template>
        <n-button v-if="enableContextMenu" quaternary>
          <n-icon >
            <EllipsisV/>
          </n-icon>
        </n-button>
      </div>
    </div>
    <div class="flex-1 flex-col flex overflow-hidden">
      <slot/>
    </div>
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