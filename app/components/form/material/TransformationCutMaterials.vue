<script
    setup
    lang="ts"
>
import type {MaterialCollection} from "~/models/collections/MaterialCollection";
import {useMaterialTransformationStore} from "~/stores/materialTransformation";
import type {Material} from "~/models/Material";
import {useMaterialCut} from "~/composables/useMaterialCut";
import {useMaterialTransformation111} from "~/composables/useMaterialTransformation111";
import {useDialog} from 'naive-ui';
import {MaterialStandardCollection} from "~/models/collections/MaterialStandardCollection";

const message = useMessage()

const props = defineProps<{
  materials: MaterialCollection
}>()

const materialTransformationStore = useMaterialTransformationStore()
const materialsLibraryStore = useMaterialLibraryStore()

const {standards} = storeToRefs(materialsLibraryStore)
const {materials: resultMaterials} = storeToRefs(materialTransformationStore)
const {undoCutOperation, restoreMaterial} = useMaterialCut()
const {processCutMaterial, findMaterialsWithOperationUuid} = useMaterialTransformation111()
const dialog = useDialog()

const showSourceMaterialCutModal = ref<boolean>(false)
const showResultMaterialCutModal = ref<boolean>(false)
const showMaterialStandardChangeModal = ref<boolean>(false)

const selectedSourceMaterialUuid = ref<string | null>(null)
const selectedResultMaterialUuid = ref<string | null>(null)
const alternativeMaterialStandards = ref<MaterialStandardCollection>(new MaterialStandardCollection())
const changeableMaterial = ref<Material | null>(null)

const selectedSourceMaterial = computed(() => {
  if (selectedSourceMaterialUuid.value === null) return null

  return props.materials.findByUuid(selectedSourceMaterialUuid.value)
})

const selectedResultMaterial = computed(() => {
  if (selectedResultMaterialUuid.value === null) return null

  return resultMaterials.value.findByUuid(selectedResultMaterialUuid.value)
})

const handleSourceMaterialClick = (uuid: string) => {
  selectedSourceMaterialUuid.value = uuid
  showSourceMaterialCutModal.value = true
}

const handleResultMaterialClick = (uuid: string) => {
  selectedResultMaterialUuid.value = uuid
  showResultMaterialCutModal.value = true
  console.log(selectedResultMaterial.value)
}

const handleSourceCutConfirmed = (cutParams: {
    quantity: number,
    amount: number,
    cutType: 'standard' | 'equal'
  }) => {
  processCutMaterial({
    material: selectedSourceMaterial.value,
    params: cutParams,
    sourceCollection: props.materials,
    resultCollection: resultMaterials.value,
    remainderCollection: resultMaterials.value
  })
}

const handleResultCutConfirmed = (cutParams: {
  quantity: number,
  amount: number,
  cutType: 'standard' | 'equal'
}) => {
  processCutMaterial({
    material: selectedResultMaterial.value,
    params: cutParams,
    sourceCollection: resultMaterials.value,
    resultCollection: resultMaterials.value,
    zeroOut: true
  })
}

const handleDeleteResultMaterial = (material: Material) => {
  // Проверяем количество отделенных частей
  if (!material.cut_operation_uuid) {
    undoCutOperation(material, props.materials, resultMaterials.value)
    return
  }

  const allCutResults = findMaterialsWithOperationUuid(
      material.cut_operation_uuid,
      props.materials,
      resultMaterials.value
  )

  if (allCutResults.length > 1) {
    dialog.warning({
      title: 'Подтверждение удаления',
      content: `Будет удалено ${allCutResults.length} материалов из этой операции резки. Продолжить?`,
      positiveText: 'Да, удалить',
      negativeText: 'Отмена',
      onPositiveClick: () => {
        undoCutOperation(material, props.materials, resultMaterials.value)
      }
    })
  } else {
    undoCutOperation(material, props.materials, resultMaterials.value)
  }
}

const handleResultMaterialChange = (material: Material) => {

  if (standards.value?.isEmpty()) return

  const opposites = standards.value.filterJoinOpposite(material.material_standard.id)

  if (opposites.isEmpty()) {
    message.error('Варианты для замены не найдены')
    return
  } else {
    showMaterialStandardChangeModal.value = true
    changeableMaterial.value = material
    alternativeMaterialStandards.value = standards.value.filterJoinOpposite(material.material_standard.id)
  }
}

const handleChangeMaterialStandard = (uuid: string) => {

  const materialStandard = standards.value?.findByUuid(uuid)

  if (!materialStandard) return

  changeableMaterial.value?.changeMaterialStandard(materialStandard)

  showMaterialStandardChangeModal.value = false
}

const handleRestoreMaterial = (material: Material) => {
  const derivedMaterials = resultMaterials.value.where('cut_from', material.uuid)

  if (derivedMaterials.getCount() > 1) {
    dialog.warning({
      title: 'Подтверждение восстановления',
      content: `Будет удалено ${derivedMaterials.getCount()} отделенных частей и восстановлен оригинальный материал. Продолжить?`,
      positiveText: 'Да, восстановить',
      negativeText: 'Отмена',
      onPositiveClick: () => {
        restoreMaterial(material, props.materials, resultMaterials.value)
      }
    })
  } else {
    restoreMaterial(material, props.materials, resultMaterials.value)
  }
}

const contextMenuOptions = computed(() => [
  {
    label: 'Резать материал',
    key: 'cut',
    action: (material: any) => {
      selectedSourceMaterialUuid.value = material.uuid
      showSourceMaterialCutModal.value = true
    }
  },
  {
    label: 'Восстановить',
    key: 'restore',
    disabled: (material: any) => !material.isChanged,
    action: (material: any) => {
      handleRestoreMaterial(material)
    }
  }
])

</script>

<template>
  <div class="flex flex-col h-full">
    <div class="grid grid-cols-3 gap-4 flex-1 min-h-0">
      <ui-card title="Доступные материалы">
        <ListMaterial
            :materials="materials"
            :context-menu-options="contextMenuOptions"
            @item-click="handleSourceMaterialClick"
            enable-context-menu
            enable-search
            class="flex-1 overflow-hidden"
        />
      </ui-card>

      <ui-card title="Результат резки" class="col-span-2">
        <TableMaterial
            enable-search
            :materials="resultMaterials"
            enable-delete
            @delete:material="handleDeleteResultMaterial"
            enable-changing
            @change:material="handleResultMaterialChange"
            @row:click="handleResultMaterialClick"
            class="h-full"
        />
      </ui-card>
    </div>
  </div>

  <ModalMaterialCut
      v-model:show="showSourceMaterialCutModal"
      :material="selectedSourceMaterial"
      @cut-confirmed="handleSourceCutConfirmed"
  />

  <ModalMaterialCut
      v-model:show="showResultMaterialCutModal"
      :material="selectedResultMaterial"
      @cut-confirmed="handleResultCutConfirmed"
  />

  <n-modal
      v-model:show="showMaterialStandardChangeModal"
      class="max-w-[30vw]"
  >
    <n-card
        title="Выберите вариант замены материала"
        class="min-h-[30vh]"
    >
      <ListMaterialStandard
          :material-standards="alternativeMaterialStandards"
          @item-click="handleChangeMaterialStandard"
      />
    </n-card>
  </n-modal>
</template>

<style scoped>

</style>