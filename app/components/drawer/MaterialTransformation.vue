<script
    setup
    lang="ts"
>

import {ref} from "vue";
import {TRANSFORMATION_TYPES} from "~/constants/transformationTypes";

const show = defineModel<boolean>('show', {required: true})

const props = defineProps<{
  transformationType: number
}>()

const transformationTypes = ref(TRANSFORMATION_TYPES)

const materialLibraryStore = useMaterialLibraryStore()
const {standards} = storeToRefs(materialLibraryStore)

const materialTransformationForm = ref()

const handleNextStep = () => {
  materialTransformationForm.value.goToNextStep()
}

const handleBackStep = () => {
  materialTransformationForm.value.goToBackStep()
}

const handleSubmit = () => {
  materialTransformationForm.value.handleSubmit()
}

const step = computed({
  get: () => materialTransformationForm.value?.step,
  set: (value) => materialTransformationForm.value.step = value
})

const hide = ref(false)

</script>

<template>
  <n-drawer
      v-model:show="show"
      placement="right"
      :width="!hide ? '95vw' : '5vw'"
      :show-mask="!hide"
  >
    <n-drawer-content class="bg-gray-100">

      <template #header>
        <div class="flex gap-4 items-center justify-between">
          <p class="font-medium text-xl">
            {{ transformationTypes.find(item => item.value === props.transformationType)?.label }}
          </p>
          <StepMaterialTransformation
              v-model:step="step"
              class="max-w-[80%]"
          />
        </div>
      </template>

      <FormMaterialTransformation
          ref="materialTransformationForm"
          :type="transformationType"
      />

      <template #footer>
        <PanelStepButtons
            :step
            :last-step="3"
            @next="handleNextStep"
            @prev="handleBackStep"
            @submit="handleSubmit"
        />
      </template>

    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>

</style>