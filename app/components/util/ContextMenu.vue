<script setup lang="ts">
import { nextTick, ref } from 'vue'

interface ContextMenuOption {
  label: string
  key: string | number
  disabled?: boolean
  type?: 'divider'
  children?: ContextMenuOption[]
}

const props = defineProps<{
  options: ContextMenuOption[]
}>()

const emit = defineEmits<{
  select: [key: string | number]
  clickoutside: []
}>()

const showDropdown = ref(false)
const x = ref(0)
const y = ref(0)

const handleSelect = (key: string | number) => {
  showDropdown.value = false
  emit('select', key)
}

const handleClickoutside = () => {
  showDropdown.value = false
  emit('clickoutside')
}

const show = (event: MouseEvent) => {
  console.log('shw')
  event.preventDefault()
  showDropdown.value = false
  nextTick().then(() => {
    showDropdown.value = true
    x.value = event.clientX
    y.value = event.clientY
  })
}

const hide = () => {
  showDropdown.value = false
}

const toggle = (event: MouseEvent) => {
  if (showDropdown.value) {
    hide()
  } else {
    show(event)
  }
}

// Экспортируем публичные методы
defineExpose({
  show,
  hide,
  toggle
})
</script>

<template>
  <n-dropdown
    placement="bottom-start"
    trigger="manual"
    :x="x"
    :y="y"
    :options="options"
    :show="showDropdown"
    :on-clickoutside="handleClickoutside"
    @select="handleSelect"
  />
</template>
