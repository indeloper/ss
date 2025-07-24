<script
    setup
    lang="ts"
>

import {useMaterialTransformation} from "~/composables/useMaterialTransformation";

const message = useMessage()
const dialog = useDialog()

const props = defineProps<{
  type: number
}>()


const materialsStore = useMaterialsStore()
const materialTransformationStore = useMaterialTransformationStore()
const projectObjectsStore = useProjectObjectsStore()
const materialTransformation = useMaterialTransformation()

const {activeMaterials} = storeToRefs(materialsStore)
const {
  type: transformationType,
  materials: resultMaterials,
  departureAt,
  comment,
  toProjectObjectId,
  usedMaterials
} = storeToRefs(materialTransformationStore)
const {selectedProjectObject} = storeToRefs(projectObjectsStore)

const workingMaterials = ref(activeMaterials.value.clone())

const step = ref(1)

const materialsForm = ref()

const goToNextStep = () => {

  if (step.value === 1) {
    if (resultMaterials.value.isEmpty()) {
      message.error('Выберите материалы')
      return
    }
  }

  step.value++
}

const goToBackStep = () => {
  step.value--
}

const handleSubmit = () => {

  dialog.warning({
    title: 'Подтверждение',
    content: 'Вы уверены, что хотите подтвердить изготовление материалов?',
    positiveText: 'Подтвердить',
    negativeText: 'Отменить',
    draggable: true,
    onPositiveClick: async () => {
      try {
        const result = await materialTransformationStore.submit();

        if (result.success) {
          message.success('Изготовление материалов успешно создано!');

          materialTransformationStore.resetForm();
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
  transformationType.value = props.type
})

onUnmounted(() => {
  materialTransformationStore.clearMaterials()
})

watch(workingMaterials, (newMaterials) => {
  usedMaterials.value = workingMaterials.value.filterChanged()
}, {deep: true})

watch(activeMaterials, (newMaterials) => {
  workingMaterials.value = newMaterials.clone()
}, {deep: true})

defineExpose({
  goToNextStep,
  goToBackStep,
  step,
  handleSubmit
})


</script>

<template>
  <template v-if="step === 1">
    <FormMaterialTransformationMaterials
        ref="materialsForm"
        :materials="workingMaterials"
        :type="transformationType"
    />
  </template>

  <template v-if="step === 2">
    <FormMaterialTransformationParams
        ref="paramsForm"
        v-model:departure-at="departureAt"
        v-model:comment="comment"
    />
  </template>

  <template v-if="step === 3">
    <FormMaterialTransformationConfirm
        ref="confirmForm"
        :type="transformationType"
        :materials="workingMaterials"
        :result-materials="resultMaterials"
        :project-object="selectedProjectObject"
        :departure-at="departureAt"
        :comment="comment"
    />
  </template>

</template>

<style scoped>

</style>