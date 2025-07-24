<script
    setup
    lang="ts"
>
import {useMaterialSupplyStore} from "~/stores/materialSupply";

const message = useMessage()
const dialog = useDialog()

const materialLibraryStore = useMaterialLibraryStore()
const materialSupplyStore = useMaterialSupplyStore()
const contractorsStore = useContractorsStore()
const operationReasonsStore = useOperationReasonsStore()
const projectObjectsStore = useProjectObjectsStore()
const materialsStore = useMaterialsStore()

const {standards} = storeToRefs(materialLibraryStore)
const {
  materials,
  departureAt,
  operationReasonId,
  contractorId,
  files,
  ttn,
  comment,
  toProjectObjectId
} = storeToRefs(materialSupplyStore)
const {contractors} = storeToRefs(contractorsStore)
const {supplyReasons} = storeToRefs(operationReasonsStore)
const {selectedProjectObject} = storeToRefs(projectObjectsStore)

const materialsForm = ref()
const paramsForm = ref()
const confirmForm = ref()

const step = ref(1)

const goToNextStep = () => {

  //валидация первый шаг
  if (step.value === 1) {
    if (materialsForm.value?.validated) {
      ++step.value
    } else {

      if (materials.value.isEmpty()) {
        message.error('Выберите материалы')
      } else {
        message.error('Заполните обязательные поля')
      }

      return;
    }
  }

  //валидация второй шаг
  if (step.value === 2) {
    if (paramsForm.value?.validated) {
      ++step.value
    } else {
      // Проверяем какие именно поля не заполнены
      const errors = []
      if (!ttn.value) errors.push('номер ТТН')
      if (!departureAt.value) errors.push('дату')
      if (!operationReasonId.value) errors.push('причину поставки')
      if (!contractorId.value) errors.push('поставщика')
      
      if (errors.length > 0) {
        message.error(`Заполните обязательные поля: ${errors.join(', ')}`)
      } else {
        message.error('Заполните обязательные поля')
      }
      return;
    }
  }
}

const goToBackStep = () => {
  if (step.value > 1) {
    step.value--
  }
}

const handleSubmit = () => {
  dialog.warning({
    title: 'Подтверждение',
    content: 'Вы уверены, что хотите подтвердить поставку материалов?',
    positiveText: 'Подтвердить',
    negativeText: 'Отменить',
    draggable: true,
    onPositiveClick: async () => {
      try {
        const result = await materialSupplyStore.submit();
        
        if (result.success) {
          message.success('Поставка материалов успешно создана!');
          
          materialSupplyStore.resetForm();
          materialsStore.loadMaterialsByProjectObject(toProjectObjectId.value)
          
          step.value = 1;
          
        } else {
          if (result.error?.errors) {
            const errorMessages = Object.values(result.error.errors).flat().join('\n');
            message.error(`Ошибка валидации:\n${errorMessages}`);
          } else if (result.error?.message) {
            message.error(result.error.message);
          } else {
            message.error('Произошла ошибка при создании поставки');
          }
        }
      } catch (error) {
        console.error('Неожиданная ошибка:', error);
        message.error('Произошла неожиданная ошибка');
      }
    },
    onNegativeClick: () => {
    }
  })
}

onBeforeMount(() => {
  operationReasonsStore.loadSupplyReasons()
  contractorsStore.loadContractors()
})

watch(
    () => supplyReasons.value,
    () => {
      if (supplyReasons.value.getCount() > 0) {
        operationReasonId.value = supplyReasons.value.getFirst().id
      }
    },
    {deep: true}
)

watch(
    () => contractors.value,
    () => {
      if (contractors.value.getCount() > 0) {
        contractorId.value = contractors.value.getAll().filter((c) => !!c.name)[0].id
      }
    },
    {deep: true}
)

defineExpose({
  goToNextStep,
  goToBackStep,
  step,
  handleSubmit
})

</script>

<template>

  <template v-if="step === 1">
    <FormMaterialSupplyMaterials
        ref="materialsForm"
        v-model:materials="materials"
        :standards="standards"
    />
  </template>

  <template v-if="step === 2">
    <FormMaterialSupplyParams
        ref="paramsForm"
        v-model:departure-at="departureAt"
        v-model:contractor-id="contractorId"
        v-model:operation-reason-id="operationReasonId"
        v-model:comment="comment"
        v-model:ttn="ttn"
        v-model:files="files"
        :supply-reasons="supplyReasons"
        :contractors="contractors"
    />
  </template>

  <template v-if="step === 3">
    <FormMaterialSupplyConfirm
        ref="confirmForm"
        :materials="materials"
        :project-object="selectedProjectObject"
        :departure-at="departureAt"
        :reason="supplyReasons.findById(operationReasonId).name"
        :contractor="contractors.findById(contractorId).name"
        :ttn="ttn"
        :comment="comment"
        :files="files"
    />
  </template>
</template>

<style scoped>

</style>