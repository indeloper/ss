<script
    setup
    lang="ts"
>

import {Material} from "~/models/Material";
import {useMaterialSupplyStore} from "~/stores/materialSupply";
import {ArrowBack, ArrowForward, Checkmark} from '@vicons/ionicons5'
import {FormStatus} from "~/enumerates/FormStatus";

const dialog = useDialog()

const props = withDefaults(defineProps<{
  buttons?: boolean,
  steps?: boolean
}>(), {
  buttons: true,
  steps: true
})

const materialLibraryStore = useMaterialLibraryStore()
const materialSupplyStore = useMaterialSupplyStore()
const contractorsStore = useContractorsStore()
const operationReasonsStore = useOperationReasonsStore()
const projectObjectsStore = useProjectObjectsStore()



const currentStep = ref<number>(1)
const paramsForm = ref()

const status = ref<FormStatus>(FormStatus.PROCESS)
const statusMessage = ref<string | null>(null)

const firstStepDescription = computed(() => {

  if (currentStep.value !== 1) {
    return 'Выбор материалов для поставки'
  }

  if (status.value === FormStatus.PROCESS) {
    return 'Выбор материалов для поставки'
  } else {
    return statusMessage.value
  }
})

const secondStepDescription = computed(() => {

  if (currentStep.value !== 2) {
    return 'Указание параметров поставки'
  }

  if (status.value === FormStatus.PROCESS) {
    return 'Указание параметров поставки'
  } else {
    return statusMessage.value
  }
})

const goNextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const goBackStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const submitParamsForm = () => {

}

onMounted(() => {
  contractorsStore.loadContractors()
  operationReasonsStore.loadSupplyReasons()
})

const submit = () => {
  dialog.warning({
    title: 'Подтверждение',
    content: 'Вы уверены, что хотите подтвердить поставку материалов?',
    positiveText: 'Подтвердить',
    onPositiveClick: () => {
      materialSupplyStore.submit()
    },
  })
}



defineExpose({
  goNextStep,
  goBackStep,
  currentStep
})

</script>

<template>
  <div class="flex-1 flex flex-col gap-4">
    <StepMaterialSupply
        v-if="steps"
        v-model:step="currentStep"
    />

    <FormMaterialSupply/>




    <!--    <n-card-->
    <!--        v-if="buttons"-->
    <!--        content-style="padding: 0; bottom: 0; sticky"-->
    <!--    >-->
    <!--      <div class="flex w-full justify-between p-4 items-center">-->
    <!--        <div>-->
    <!--          <n-button-->
    <!--              :disabled="currentStep === 1"-->
    <!--              type="primary"-->
    <!--              @click="goBackStep"-->
    <!--          >-->
    <!--            <n-icon>-->
    <!--              <ArrowBack/>-->
    <!--            </n-icon>-->
    <!--            Назад-->
    <!--          </n-button>-->
    <!--        </div>-->
    <!--        <div>-->
    <!--          <n-button-->
    <!--              v-if="currentStep !== 3"-->
    <!--              :disabled="status !== FormStatus.PROCESS"-->
    <!--              type="primary"-->
    <!--              @click="goNextStep"-->
    <!--          >-->
    <!--            Далее-->
    <!--            <n-icon>-->
    <!--              <ArrowForward/>-->
    <!--            </n-icon>-->
    <!--          </n-button>-->
    <!--          <n-button-->
    <!--              v-else-->
    <!--              type="primary"-->
    <!--              @click="submit"-->
    <!--          >-->
    <!--            Подтвердить-->
    <!--            <n-icon>-->
    <!--              <Checkmark/>-->
    <!--            </n-icon>-->
    <!--          </n-button>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--    </n-card>-->
  </div>
</template>

<style scoped>

</style>