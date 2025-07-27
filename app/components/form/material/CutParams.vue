<script
    setup
    lang="ts"
>

import type { Material } from "~/models/Material";
import { useMaterialCut } from "~/composables/useMaterialCut";

const props = defineProps<{
  material: Material | null,
  splitMode?: boolean
}>()

const emit = defineEmits<{
  cutCalculated: [result: {
    material: Material,
    cutParams: {
      quantity: number,
      amount: number,
      cutType: 'standard' | 'equal'
    },
    cutResult: {
      result: Material,
      remainder: Material[],
      unusedPart: Material | null
    }
  } | null]
}>()

const quantity = ref(0)
const amount = ref(1)
const cutType = ref<'standard' | 'equal'>('standard')

const { cutMaterial, getMaxPossibleAmount } = useMaterialCut()

// Отслеживаем изменения материала для сброса формы
watch(() => props.material, (newMaterial) => {
  if (newMaterial) {
    quantity.value = newMaterial.quantity || 0
    amount.value = 1
    cutType.value = 'standard'
  }
}, { immediate: true })

// Отслеживаем изменения quantity и cutType для корректировки amount
watch([quantity, cutType], () => {
  if (props.material && amount.value > maxAmount.value) {
    amount.value = Math.max(1, maxAmount.value)
  }
}, { immediate: false })

// Максимальные значения для валидации
const maxQuantity = computed(() => props.material?.quantity || 0)
const maxAmount = computed(() => {
  if (!props.material || quantity.value <= 0) {
    return props.material?.amount || 0
  }
  
  return getMaxPossibleAmount(props.material, quantity.value, cutType.value)
})

// Валидация ввода
const isQuantityValid = computed(() => quantity.value > 0 && quantity.value <= maxQuantity.value)
const isAmountValid = computed(() => amount.value > 0 && amount.value <= maxAmount.value)
const isInputValid = computed(() => isQuantityValid.value && isAmountValid.value)

// Вычисляем результат резки в реальном времени
const cutResult = computed(() => {
  if (!props.material || !isInputValid.value) {
    return null
  }
  
  return cutMaterial(props.material, quantity.value, amount.value, cutType.value)
})

// Опции для выбора типа резки
const cutTypeOptions = [
  { label: 'Стандартная резка', value: 'standard' },
  { label: 'Равноценная резка', value: 'equal' }
]

// Эмитим результат при изменении
watch([cutResult, () => props.material], () => {
  if (!props.material) {
    emit('cutCalculated', null)
    return
  }

  if (cutResult.value) {
    emit('cutCalculated', {
      material: props.material,
      cutParams: {
        quantity: quantity.value,
        amount: amount.value,
        cutType: cutType.value
      },
      cutResult: cutResult.value
    })
  } else {
    emit('cutCalculated', null)
  }
}, { immediate: true })

// Публичные методы для внешнего использования
const resetForm = () => {
  if (props.material) {
    quantity.value = props.material.quantity || 0
    amount.value = 1
    cutType.value = 'standard'
  }
}

const getCurrentParams = () => ({
  quantity: quantity.value,
  amount: amount.value,
  cutType: cutType.value
})

const isValid = () => isInputValid.value

defineExpose({
  resetForm,
  getCurrentParams,
  isValid,
  cutResult
})
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <n-form>
      <n-form-item label="Объем">
        <n-input-number
            placeholder="Укажите отделяемый объем материала"
            v-model:value="quantity"
            class="w-full"
            :min="0"
            :max="maxQuantity"
            :status="isQuantityValid ? 'success' : 'error'"
            :disabled="material?.isFixedQuantity && splitMode"
        />
      </n-form-item>
      
      <n-form-item label="Количество единиц">
        <n-input-number
            placeholder="Укажите количество единиц"
            v-model:value="amount"
            class="w-full"
            :min="1"
            :max="maxAmount"
            :status="isAmountValid ? 'success' : 'error'"
        />
      </n-form-item>
      
      <n-form-item v-if="!splitMode" label="Тип резки">
        <n-select
            v-model:value="cutType"
            :options="cutTypeOptions"
            class="w-full"
        />
      </n-form-item>
    </n-form>
    
    <div>
      <div class="mb-4">
        <h4 class="font-medium mb-2">Исходный материал:</h4>
        <div class="bg-gray-50 p-3 rounded text-sm">
          <p><strong>Тип:</strong> {{ props.material?.getDisplayType() }}</p>
          <p><strong>Марка:</strong> {{ props.material?.getDisplayBrands() }}</p>
          <p><strong>Объем:</strong> {{ props.material?.getDisplayQuantity() }}</p>
          <p><strong>Количество:</strong> {{ props.material?.getDisplayAmount() }}</p>
        </div>
      </div>
      
      <!-- Фиксированная область для результатов с плавными переходами -->
      <div class="min-h-[300px] max-h-[400px] overflow-y-auto">
        <transition name="fade" mode="out-in">
          <div v-if="cutResult" key="result">
            <h4 class="font-medium mb-2">Результат {{ splitMode ? 'разделения' : 'резки' }} <span v-if="!splitMode">({{ cutTypeOptions.find(opt => opt.value === cutType)?.label }})</span>:</h4>
            <div class="space-y-3 text-sm">
              <div class="bg-green-50 p-3 rounded">
                <p class="font-medium text-green-800">Результат:</p>
                <p>Объем: {{ cutResult.result.quantity.toFixed(2) }} {{ props.material?.material_standard?.material_type?.material_unit?.label }}</p>
                <p>Количество: {{ cutResult.result.amount }} шт.</p>
              </div>
              
              <div v-if="cutResult.remainder.length > 0" class="bg-yellow-50 p-3 rounded">
                <p class="font-medium text-yellow-800">Остатки:</p>
                <div v-for="(rem, index) in cutResult.remainder" :key="index" class="mb-2 last:mb-0">
                  <p>Объем: {{ rem.quantity.toFixed(2) }} {{ props.material?.material_standard?.material_type?.material_unit?.label }}</p>
                  <p>Количество: {{ rem.amount }} шт.</p>
                </div>
              </div>
              
              <div v-if="cutResult.unusedPart && (cutResult.unusedPart.quantity > 0 || cutResult.unusedPart.amount > 0)" class="bg-blue-50 p-3 rounded">
                <p class="font-medium text-blue-800">{{ splitMode ? 'Остаток' : 'Неиспользованная часть' }}:</p>
                <p>Объем: {{ cutResult.unusedPart.quantity.toFixed(2) }} {{ props.material?.material_standard?.material_type?.material_unit?.label }}</p>
                <p>Количество: {{ cutResult.unusedPart.amount }} шт.</p>
              </div>
            </div>
          </div>
          
          <div v-else-if="props.material" key="placeholder" class="text-gray-500 text-sm">
            <div v-if="!isQuantityValid && quantity > 0" class="text-red-500 mb-2">
              ⚠️ Объем не может превышать {{ maxQuantity.toFixed(2) }} {{ props.material?.material_standard?.material_type?.material_unit?.label }}
            </div>
            <div v-if="!isAmountValid && amount > 0" class="text-red-500 mb-2">
              ⚠️ Количество не может превышать {{ maxAmount }} шт.
            </div>
            <div v-if="quantity <= 0 || amount <= 0" class="text-gray-400">
              Укажите корректные значения для расчета
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>