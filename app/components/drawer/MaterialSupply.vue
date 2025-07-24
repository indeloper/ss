<script
    setup
    lang="ts"
>

const show = defineModel<boolean>('show', {required: true})
const materialLibraryStore = useMaterialLibraryStore()
const {standards} = storeToRefs(materialLibraryStore)

const materialSupplyForm = ref()

const handleNextStep = () => {
  materialSupplyForm.value.goToNextStep()
}

const handleBackStep = () => {
  materialSupplyForm.value.goToBackStep()
}

const handleSubmit = () => {
  materialSupplyForm.value.handleSubmit()
}

const step = computed({
  get: () => materialSupplyForm.value?.step,
  set: (value) => materialSupplyForm.value.step = value
})

</script>

<template>
  <n-drawer
      v-model:show="show"
      placement="right"
      width="90vw"
  >
    <n-drawer-content title="Поставка материалов">

      <template #header>
        <div class="flex gap-4 items-center justify-between">
          <p class="font-medium text-xl">Поставка материалов</p>
          <StepMaterialSupply
              v-model:step="step"
              class="max-w-[80%]"
          />
        </div>
      </template>
      
      <FormMaterialSupply ref="materialSupplyForm"/>

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