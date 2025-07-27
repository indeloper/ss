<script
    lang="ts"
    setup
>
import type {Material} from "~/models/Material";
import type {MaterialCollection} from "~/models/collections/MaterialCollection";
import type {CutParams} from "~/composables/useMaterialTransformation";
import {AngleRight} from '@vicons/fa'

const props = defineProps<{
  materials: MaterialCollection,
}>()

const materialTransformationStore = useMaterialTransformationStore()

const {
  filteredMaterials,
  cutMaterialOnePart,
  cutMaterialFull,
  cutMaterialWithParams
} = useMaterialTransformation(
    props.materials,
    materialTransformationStore.materials
)

const selectedSourceMaterial = ref<Material | null>(null)
const showSourceMaterialSplitModal = ref<boolean>(false)

const openSourceMaterialSplitModal = (material: Material) => {
  selectedSourceMaterial.value = material
  showSourceMaterialSplitModal.value = true
}

const handleSourceMaterialDoubleClick = (uuid: string) => {
  const material = props.materials.findByUuidOrFail(uuid)
  cutMaterialOnePart(material, props.materials, materialTransformationStore.materials)
}

const handleSourceMaterialCutConfirmed = (params: CutParams) => {
  if (!selectedSourceMaterial.value) return
  cutMaterialWithParams(selectedSourceMaterial.value, params, props.materials, materialTransformationStore.materials)
}

const handleDropToSelectedMaterials = (event: DragEvent) => {
  const materialUuid = event.dataTransfer?.getData('text/plain')
  if (!materialUuid) return

  const material = props.materials.findByUuidOrFail(materialUuid)
  if (!material) return

  cutMaterialFull(material, props.materials, materialTransformationStore.materials)
}

</script>

<template>
  <div class="flex flex-col h-full">
    <div class="grid grid-cols-3 gap-4 flex-1 min-h-0">
      <ui-card title="Доступные материалы">
        <ListMaterial
            :materials="filteredMaterials"
            :item-disabled="item => item.isZeroed"
            @item-double-click="handleSourceMaterialDoubleClick"
            @drag-start="(event, uuid) => event.dataTransfer?.setData('text/plain', uuid)"
            enable-draggable
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
        <ListMaterial :materials="materialTransformationStore.materials">
        </ListMaterial>
      </ui-card>
      <ui-card title="Результат"></ui-card>
    </div>
  </div>

  <ModalMaterialCut
      v-model:show="showSourceMaterialSplitModal"
      :material="selectedSourceMaterial"
      split-mode
      v-if="selectedSourceMaterial"
      @cut-confirmed="handleSourceMaterialCutConfirmed"
  />

</template>