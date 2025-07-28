<script
    setup
    lang="ts"
>
import {MaterialCollection} from "~/models/collections/MaterialCollection";
import {useMaterialTransformationStore} from "~/stores/materialTransformation";
import {Material} from "~/models/Material";
import {useMaterialCut} from "~/composables/useMaterialCut";
import {useMaterialTransformation111} from "~/composables/useMaterialTransformation111";
import {useDialog} from 'naive-ui';
import {MaterialStandardCollection} from "~/models/collections/MaterialStandardCollection";
import {watch} from 'vue';
import {Trash, Cog, Undo} from '@vicons/fa'

const message = useMessage()

const props = defineProps<{
  materials: MaterialCollection
}>()

const materialTransformationStore = useMaterialTransformationStore()
const materialsLibraryStore = useMaterialLibraryStore()

const {standards} = storeToRefs(materialsLibraryStore)
const {materials: resultMaterials} = storeToRefs(materialTransformationStore)
const {undoCutOperation, restoreMaterial} = useMaterialCut()
const {
  filteredMaterials,
  processCutOnePartResult,
  processCutAllResult,
  processCutResult,
  findMaterialsWithOperationUuid
} = useMaterialTransformation111(props.materials)


const dialog = useDialog()

const showSourceMaterialCutModal = ref<boolean>(false)
const showResultMaterialCutModal = ref<boolean>(false)
const showMaterialStandardChangeModal = ref<boolean>(false)

const selectedSourceMaterialUuid = ref<string | null>(null)
const selectedResultMaterialUuid = ref<string | null>(null)
const alternativeMaterialStandards = ref<MaterialStandardCollection>(new MaterialStandardCollection())
const changeableMaterial = ref<Material | null>(null)
const selectedMaterials = ref<MaterialCollection>(new MaterialCollection())
const confirmedResults = ref<MaterialCollection>(new MaterialCollection())

// Отфильтрованные доступные материалы (показываем только совместимые)
const filteredAvailableMaterials = computed(() => {
  return filteredMaterials.value

})

// Следим за изменениями в selectedMaterials и фильтруем доступные материалы
watch(selectedMaterials, (newSelectedMaterials) => {
  if (newSelectedMaterials.isEmpty()) {
    // Если нет выбранных материалов, показываем все доступные
    filteredAvailableMaterials.value = props.materials
  } else {
    // Берем первый выбранный материал как эталон для совместимости
    const firstSelectedMaterial = newSelectedMaterials.getAll()[0]

    // Фильтруем доступные материалы, оставляя только совместимые
    filteredAvailableMaterials.value = filteredAvailableMaterials.value.findCompatibleMaterials(firstSelectedMaterial)
  }
}, {deep: true})

const selectedSourceMaterial = computed(() => {
  if (selectedSourceMaterialUuid.value === null) return null
  return props.materials.findByUuidOrFail(selectedSourceMaterialUuid.value)
})

const selectedResultMaterial = computed(() => {
  if (selectedResultMaterialUuid.value === null) return null
  return resultMaterials.value.findByUuidOrFail(selectedResultMaterialUuid.value)
})

const resultMaterialFromProperty9Standard = computed(() => {
  if (selectedMaterials.value.isEmpty()) return null

  const firstSelectedMaterial = selectedMaterials.value.getAll()[0]
  if (!firstSelectedMaterial.material_standard) return null

  const standardsWithProperty9 = standards.value?.filterStandardsWithSameBrandsAndProperty9(
      firstSelectedMaterial.material_standard.id
  )

  if (!standardsWithProperty9 || standardsWithProperty9.isEmpty()) return null

  const targetStandard = standardsWithProperty9.getAll()[0]

  const resultMaterial = new Material({
    uuid: `result-${Date.now()}`,
    material_standard: targetStandard,
    quantity: selectedMaterials.value.getTotalAmountQuantity(),
    amount: 1,
    total_weight: selectedMaterials.value.getTotalWeight(),
    is_zeroed: false,
    cut_operation_uuid: null,
    original_material_uuid: null
  })

  return resultMaterial
})

const handleSourceMaterialClick = (uuid: string) => {
  selectedSourceMaterialUuid.value = uuid
  const material = props.materials.findByUuidOrFail(uuid)

  if (material?.isFixedQuantity && material?.isLastUnit) {
    handleSourceMaterialDoubleClick(uuid)
    return
  }

  showSourceMaterialCutModal.value = true
}

const handleSourceMaterialDoubleClick = (uuid: string) => {
  const material = props.materials.findByUuidOrFail(uuid)
  processCutOnePartResult(material, props.materials, selectedMaterials.value as MaterialCollection)
}

const handleSourceCutConfirmed = (result: {
  material: any,
  cutParams: {
    quantity: number,
    amount: number,
    cutType: 'standard' | 'equal'
  },
  cutResult: {
    result: any,
    remainder: any[],
    unusedPart: any | null
  }
}) => {
  processCutResult(result, props.materials, selectedMaterials.value as MaterialCollection)
}

const handleDropToSelectedMaterials = (event: DragEvent) => {
  event.preventDefault()

  const materialUuid = event.dataTransfer?.getData('text/plain')

  if (!materialUuid) return

  const material = props.materials.findByUuidOrFail(materialUuid)

  processCutAllResult(material, props.materials, selectedMaterials.value as MaterialCollection)
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'move'
}

const handleDragStart = (event: DragEvent, uuid: string) => {
  event.dataTransfer?.setData('text/plain', uuid)
}

// const handleResultCutConfirmed = (result: {
//   material: any,
//   cutParams: {
//     quantity: number,
//     amount: number,
//     cutType: 'standard' | 'equal'
//   },
//   cutResult: {
//     result: any,
//     remainder: any[],
//     unusedPart: any | null
//   }
// }) => {
//   processCutResult(result, resultMaterials.value, resultMaterials.value, false)
// }

const handleDeleteSelectedMaterial = (material: Material) => {
  if (!material.cut_operation_uuid) {
    undoCutOperation(material, props.materials, selectedMaterials.value as MaterialCollection)
    return
  }

  const allCutResults = findMaterialsWithOperationUuid(
      material.cut_operation_uuid,
      props.materials,
      selectedMaterials.value as MaterialCollection
  )

  if (allCutResults.length > 1) {
    dialog.warning({
      title: 'Подтверждение удаления',
      content: `Будет удалено ${allCutResults.length} материалов из этой операции резки. Продолжить?`,
      positiveText: 'Да, удалить',
      negativeText: 'Отмена',
      onPositiveClick: () => {
        undoCutOperation(material, props.materials, selectedMaterials.value as MaterialCollection)
      }
    })
  } else {
    undoCutOperation(material, props.materials, selectedMaterials.value as MaterialCollection)
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

  const materialStandard = standards.value?.findByUuidOrFail(uuid)

  changeableMaterial.value?.changeMaterialStandard(materialStandard)

  showMaterialStandardChangeModal.value = false
}

const handleRestoreMaterial = (material: Material) => {
  const derivedMaterials = resultMaterials.value.filterCutFormMaterial(material)

  if (derivedMaterials.length > 1) {
    dialog.warning({
      title: 'Подтверждение восстановления',
      content: `Будет удалено ${derivedMaterials.length} отделенных частей и восстановлен оригинальный материал. Продолжить?`,
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

const handlePreviewResultMaterialClick = () => {
  console.log(resultMaterialFromProperty9Standard.value)
}

const handleClearSelectedMaterials = () => {
  selectedMaterials.value.getAll().forEach(material => {
    handleDeleteSelectedMaterial(material)
  })
}

const showResultSettingsModal = ref(false)

const openResultSettingsModal = () => {
  showResultSettingsModal.value = true
}

const materialsContextMenuOptions = computed(() => [
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

const selectedMaterialsContextMenuOptions = computed(() => [
  {
    label: 'Удалить',
    key: 'cut',
    action: (material: any) => {
      handleDeleteSelectedMaterial(material)
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

const selected = ref()

const handleResultMaterialClick = (uuid: string) => {
  selectedResultMaterialUuid.value = uuid
  showResultMaterialCutModal.value = true
  console.log(selectedResultMaterial.value)
}

const handleConfirm = () => {
  if (selectedMaterials.value.getTotalAmount() <= 1) {
    message.error('Недостаточно материалов для стыковки')
    return
  }
  confirmedResults.value.add(resultMaterialFromProperty9Standard.value)
  selectedMaterials.value.getAll().forEach(material => {
    material.join_to = resultMaterialFromProperty9Standard.value.uuid
  })
  selectedMaterials.value = new MaterialCollection()
}

const handleUndoConfirm = (uuid: string) => {
  const resultMaterial = confirmedResults.value.findByUuidOrFail(uuid)
  const joinedMaterials = props.materials.filterByJoinTo(uuid)
  joinedMaterials.getAll().forEach(material => {
    material.join_to = null
  })
  confirmedResults.value.remove(resultMaterial)
  selectedMaterials.value = new MaterialCollection([...selectedMaterials.value, ...joinedMaterials])
}

const selectedResultUuid = ref()

// Отфильтрованные выбранные материалы с учетом join_to
const filteredSelectedMaterials = computed(() => {
  if (selectedResultUuid.value) {
    // Если выбран результат, показываем материалы, которые были использованы для его создания
    return props.materials.filterByJoinTo(selectedResultUuid.value)
  } else {
    // Если результат не выбран, показываем только материалы без join_to (не использованные в стыковке)
    return selectedMaterials.value.filterByJoinTo(null)
  }
})

</script>

<template>
  <div class="flex flex-col h-full">
    <div class="grid grid-cols-3 gap-4 flex-1 min-h-0">
      <ui-card title="Доступные материалы">
        <ListMaterial
            :materials="filteredAvailableMaterials"
            :context-menu-options="materialsContextMenuOptions"
            @item-click="handleSourceMaterialClick"
            @item-double-click="handleSourceMaterialDoubleClick"
            @item-drag-start="(event, uuid) => handleDragStart(event, uuid)"
            enable-context-menu
            enable-draggable
            enable-search
            class="h-full"
            :item-disabled="item => item.isZeroed"
        />
      </ui-card>
      <ui-card
          title="Выбранные материалы"
          enable-drop
          @drop="handleDropToSelectedMaterials"
          @dragover="handleDragOver"
      >
        <template #actions>
          <n-button
              type="error"
              :disabled="selectedMaterials.isEmpty()"
              tertiary
              @click="handleClearSelectedMaterials"
          >
            <n-icon>
              <Trash/>
            </n-icon>
            Очистить
          </n-button>

        </template>
        <div
            v-if="!filteredSelectedMaterials.isEmpty() && resultMaterialFromProperty9Standard"
            class="p-1"
        >
          <p class="font-medium text-gray-500 mb-2">Результат:</p>
          <CardMaterial
              :material="resultMaterialFromProperty9Standard"
              @click="handlePreviewResultMaterialClick"
          >
            <!--            <template #action>-->
            <!--              <n-button-->
            <!--                  quaternary-->
            <!--                  @click.stop="openResultSettingsModal"-->
            <!--              >-->
            <!--                <n-icon>-->
            <!--                  <Cog/>-->
            <!--                </n-icon>-->
            <!--              </n-button>-->
            <!--            </template>-->
          </CardMaterial>
          <n-divider/>
        </div>

        <p
            v-if="!filteredSelectedMaterials.isEmpty()"
            class="font-medium text-gray-500 mb-2 ps-1"
        >Использовано:</p>
        <ListMaterial
            v-if="!filteredSelectedMaterials.isEmpty()"
            :materials="filteredSelectedMaterials"
            :context-menu-options="selectedMaterialsContextMenuOptions"
            enable-context-menu
            class="flex-1 overflow-hidden"
            enable-selection
            v-model:selection="selected"
        >
        </ListMaterial>
        <p
            v-else
            class="text-center text-gray-500 mt-4 font-semibold flex-1 flex flex col justify-center items-center"
        >
          Выберите или перетащите материал из списка доступных
        </p>

        <template #footer>
          <div class="flex justify-end">
            <n-button
                type="primary"
                :disabled="selectedMaterials.isEmpty()"
                @click="handleConfirm"
            >
              Подтвердить
            </n-button>
          </div>
        </template>
      </ui-card>
      <ui-card title="Результат">
        <ListMaterial
            :materials="confirmedResults"
            :context-menu-options="materialsContextMenuOptions"
            enable-context-menu
            class="flex-1 overflow-hidden"
        >
          <template #card-action="{item}">
            <n-button quaternary @click="handleUndoConfirm(item.uuid)">
              <n-icon>
                <Undo/>
              </n-icon>
            </n-button>
          </template>
        </ListMaterial>
      </ui-card>
    </div>
  </div>

  <ModalMaterialCut
      v-if="selectedSourceMaterial"
      v-model:show="showSourceMaterialCutModal"
      :material="selectedSourceMaterial"
      @cut-confirmed="handleSourceCutConfirmed"
      split-mode
  />

  <ModalMaterialCut
      v-model:show="showResultMaterialCutModal"
      :material="selectedResultMaterial"
      @cut-confirmed="handleResultCutConfirmed"
  />

  <n-modal
      v-model:show="showResultSettingsModal"
      class="min-w-[60vw]"
  >
    <ui-card>
      <FormMaterialJoinResultSettings
          v-if="resultMaterialFromProperty9Standard"
          :material="resultMaterialFromProperty9Standard"
          :selected-materials="selectedMaterials"
      />
    </ui-card>
  </n-modal>

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
.custom-card {
  background-color: #fff;
  border: 1px solid #e0e0e6;
  border-radius: 6px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.12);
  transition: box-shadow 0.3s var(--n-bezier);
}

.custom-card:hover {
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
}

.custom-card-header {
  padding: 20px 24px 0 24px;
  flex-shrink: 0;
}

.custom-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #18181c;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.custom-card-body {
  padding: 0 24px 24px 24px;
  min-height: 0;
}
</style>