<script setup lang="ts">
import { NInput, NInputNumber } from 'naive-ui'
import { computed, defineComponent, h, nextTick, ref } from 'vue'

interface Props {
  value: number
  field: 'quantity' | 'amount'
  mode: 'edit' | 'create'
  material?: any
  onUpdateValue: (value: number) => void
}

const props = defineProps<Props>()

const isEdit = ref(false)
const inputRef = ref<any>(null)
const inputValue = ref(props.value)
const originalValue = ref(props.value)

const isQuantityDisabled = computed(() => {
  if (props.mode === 'create') return false
  return props.field === 'quantity' && props.material?.fixed_quantity === true
})

const minValue = computed(() => {
  return 0
})

const maxValue = computed(() => {
  if (props.mode === 'create') return undefined
  if (props.field === 'quantity') {
    return props.material?.quantity || undefined
  }
  if (props.field === 'amount') {
    return props.material?.amount || undefined
  }
  return undefined
})

const step = computed(() => {
  return props.field === 'amount' ? 1 : 0.01
})

const precision = computed(() => {
  return props.field === 'amount' ? 0 : 2
})

function handleOnClick() {
  if (isQuantityDisabled.value) return
  
  originalValue.value = props.value
  inputValue.value = props.value
  isEdit.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function handleChange() {
  if (inputValue.value < minValue.value) {
    inputValue.value = minValue.value
  }
  
  if (maxValue.value !== undefined && inputValue.value > maxValue.value) {
    inputValue.value = maxValue.value
  }
  
  // Проверяем, действительно ли значение изменилось
  if (Math.abs(inputValue.value - originalValue.value) > 0.001) {
    props.onUpdateValue(inputValue.value)
  }
  
  isEdit.value = false
}

function handleBlur() {
  handleChange()
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    handleChange()
  } else if (e.key === 'Escape') {
    inputValue.value = originalValue.value
    isEdit.value = false
  }
}

const cellStyle = computed(() => ({
  minHeight: '22px',
  cursor: isQuantityDisabled.value ? 'not-allowed' : 'pointer',
  opacity: isQuantityDisabled.value ? 0.6 : 1
}))

const renderValue = () => {
  if (props.field === 'amount') {
    return `${props.value} шт.`
  }
  
  const unit = props.material?.material_standard?.material_type?.material_unit?.label || ''
  return `${props.value} ${unit}`
}

const renderInput = () => {
  if (props.field === 'amount') {
      return h(NInputNumber, {
    ref: inputRef,
    value: inputValue.value,
    min: minValue.value,
    max: maxValue.value,
    step: step.value,
    precision: precision.value,
    onUpdateValue: (v: number) => {
      inputValue.value = v
    },
    onBlur: handleBlur,
    onKeydown: handleKeyDown
  })
  }
  
  return h(NInputNumber, {
    ref: inputRef,
    value: inputValue.value,
    min: minValue.value,
    max: maxValue.value,
    step: step.value,
    precision: precision.value,
    onUpdateValue: (v: number) => {
      inputValue.value = v
    },
    onBlur: handleBlur,
    onKeydown: handleKeyDown
  })
}

// Синхронизируем значение при изменении props
watch(() => props.value, (newValue) => {
  inputValue.value = newValue
})
</script>

<template>
  <div
    :style="cellStyle"
    @click="handleOnClick"
  >
    <template v-if="isEdit">
      <component :is="renderInput()" />
    </template>
    <template v-else>
      {{ renderValue() }}
    </template>
  </div>
</template> 