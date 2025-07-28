<script
    lang="ts"
    setup
>
import type {Material} from "~/models/Material";
import type {MaterialCollection} from "~/models/collections/MaterialCollection";
import type {CutParams} from "~/composables/useMaterialTransformation111";
import {AngleRight} from '@vicons/fa'

const message = useMessage()

const props = defineProps<{
  materials: MaterialCollection,
}>()

const materialTransformationStore = useMaterialTransformationStore()

const {
  sheets,
  filteredMaterials,
  filteredSelectedMaterials,
  previewResult,
  resultMaterials,
  cutMaterialOnePart,
  cutMaterialFull,
  cutMaterialWithParams,
  undoCutMaterial,
  restoreMaterial,
  confirmJoinResult,
  canMaterialBeJoined,
  editJoinResult,
  deleteJoinResult,
  clearUnjoined
} = useMaterialTransformation(
    props.materials,
    materialTransformationStore.materials
)

const selectedSourceMaterial = ref<Material | null>(null)
const showSourceMaterialSplitModal = ref<boolean>(false)
const showResultMaterialSettingsModal = ref<boolean>(false)

const openSourceMaterialSplitModal = (material: Material) => {
  selectedSourceMaterial.value = material
  showSourceMaterialSplitModal.value = true
}

const handleSourceMaterialDoubleClick = (uuid: string) => {
  const material = props.materials.findByUuidOrFail(uuid)
  if (canMaterialBeJoined(material)) {
    cutMaterialOnePart(material, props.materials, materialTransformationStore.materials)
  }
}

const handleSourceMaterialCutConfirmed = (params: CutParams) => {
  if (!selectedSourceMaterial.value) return
  if (canMaterialBeJoined(selectedSourceMaterial.value)) {
    cutMaterialWithParams(selectedSourceMaterial.value, params, props.materials, materialTransformationStore.materials)
  }
}

const handleDropToSelectedMaterials = (event: DragEvent) => {
  const materialUuid = event.dataTransfer?.getData('text/plain')
  if (!materialUuid) return

  const material = props.materials.findByUuidOrFail(materialUuid)
  if (!material) return
  if (canMaterialBeJoined(material)) {
    cutMaterialFull(material, props.materials, materialTransformationStore.materials)
  }
}

const handleConfirmResult = () => {

  if (filteredSelectedMaterials.value.getCount() <= 1) {
    message.warning('Для стыковки необходимо 2 или более материалов')
    return
  }

  showResultMaterialSettingsModal.value = true
}

const handleClearUnjoined = () => {
  clearUnjoined()
}

const selectedMaterialsContextMenuOptions = ref([
  {
    label: 'Отменить',
    key: 'undo',
    action: (material: Material) => {
      undoCutMaterial(material)
    }
  }
])

const sourceMaterialsContextMenuOptions = ref([
  {
    label: 'Восстановить',
    key: 'undo',
    action: (material: Material) => {
      restoreMaterial(material)
    }
  }
])

const resultMaterialsContextMenuOptions = ref([
  {
    label: 'Редактировать',
    key: 'edit',
    action: (material: Material) => {
      editJoinResult(material)
    }
  },
  {
    label: 'Удалить',
    key: 'delete',
    action: (material: Material) => {
      deleteJoinResult(material)
    }
  }
])

</script>

<template>
  <div class="flex flex-col h-full">
    <div class="grid grid-cols-3 gap-4 flex-1 min-h-0">
      <ui-card title="Доступные материалы">
        <n-alert
            v-if="previewResult"
            type="success"
            :show-icon="false"
        >
          Список материалов отфильтрован, исходя из выбранного материала
        </n-alert>
        <ListMaterial
            :materials="filteredMaterials"
            :item-disabled="item => item.isZeroed"
            @item-double-click="handleSourceMaterialDoubleClick"
            @drag-start="(event, uuid) => event.dataTransfer?.setData('text/plain', uuid)"
            enable-draggable
            enable-context-menu
            :context-menu-options="sourceMaterialsContextMenuOptions"
        >
          <template #item-action="{item}">
            <n-button
                quaternary
                @click.stop="openSourceMaterialSplitModal(item)"
            >
              <n-icon>
                <AngleRight/>
              </n-icon>
            </n-button>
          </template>
        </ListMaterial>
      </ui-card>
      <ui-card
          title="Выбранные материалы"
          enable-drop
          @drop="handleDropToSelectedMaterials"
      >
        <template #actions>
          <n-button @click="handleClearUnjoined">Очистить</n-button>
        </template>
        <CardMaterial
            v-if="previewResult"
            :material="previewResult"
        />

        <n-divider v-if="previewResult"/>

        <ListMaterial
            :materials="filteredSelectedMaterials"
            enable-context-menu
            :context-menu-options="selectedMaterialsContextMenuOptions"
        />
        <template #footer>
          <div class="flex justify-end">
            <n-button
                @click="handleConfirmResult"
                type="primary"
            >
              Подтвердить
            </n-button>
          </div>
        </template>
      </ui-card>
      <ui-card title="Результат">
        <ListMaterial
            :materials="resultMaterials"
            enable-context-menu
            :context-menu-options="resultMaterialsContextMenuOptions"
        />
      </ui-card>
    </div>
  </div>

  <n-modal
      v-model:show="showResultMaterialSettingsModal"
      class="min-w-[60vw] min-h-[60vh]"
  >
    <ui-card title="Параметры создания результата">
      <n-alert
          type="success"
          :show-icon="false"
      >
        Для стыковки не обходимо добавить лист
        <p>{{ filteredSelectedMaterials.getCount() - 1 }}</p>
      </n-alert>
      <n-divider/>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="mb-2 font-medium">Доступный лист:</p>
          <ListMaterial :materials="sheets"/>
        </div>
        <div>
          <p class="mb-2 font-medium">Результат:</p>
          <CardMaterial
              v-if="previewResult"
              :material="previewResult"
          />
        </div>
      </div>
    </ui-card>
  </n-modal>

  <ModalMaterialCut
      v-model:show="showSourceMaterialSplitModal"
      :material="selectedSourceMaterial"
      split-mode
      v-if="selectedSourceMaterial"
      @cut-confirmed="handleSourceMaterialCutConfirmed"
  />

</template>