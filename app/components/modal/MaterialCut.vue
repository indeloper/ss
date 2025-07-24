<script setup lang="ts">
import type { Material } from "~/models/Material";
import CutParams from "~/components/form/material/CutParams.vue";

const show = defineModel<boolean>('show', { required: true })

const props = defineProps<{
  material: Material | null
}>()

const emit = defineEmits<{
  cutConfirmed: [result: {
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
  }]
}>()

const cutParamsRef = ref<InstanceType<typeof CutParams> | null>(null)
const currentCutData = ref<any>(null)

watch(show, (isShown) => {
  if (isShown && cutParamsRef.value) {
    cutParamsRef.value.resetForm()
  }
})

const handleCutCalculated = (result: any) => {
  currentCutData.value = result
}

const handleConfirm = () => {
  if (!currentCutData.value) return
  
  emit('cutConfirmed', currentCutData.value)
  show.value = false
}
</script>

<template>
  <n-modal v-model:show="show" class="max-w-[60vw] min-h-[80vh]">
    <n-card title="Резка материала">
      <CutParams
          ref="cutParamsRef"
          :material="material"
          @cut-calculated="handleCutCalculated"
      />

      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="show = false">Отмена</n-button>
          <n-button type="primary" :disabled="!currentCutData" @click="handleConfirm">Применить</n-button>
        </div>
      </template>
    </n-card>
  </n-modal>
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