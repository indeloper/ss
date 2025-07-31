<script
    lang="ts"
    setup
>
import type {MaterialCollection} from "~/models/collections/MaterialCollection";
import {useMaterialTransformation} from "~/composables/useMaterialTransformation";
import type {Material} from "~/models/Material";

const props = defineProps<{
  type: number,
  materials: MaterialCollection
}>()

const {
  filteredMaterials,
  selectedSourceMaterial,
  selectedResultMaterial,
  showSourceMaterialCutFormModal,
  showSelectedMaterialCutFormModal,
  showResultMaterialSettingsModal,
  materialCutFormModeIsSplit,
  selectedMaterials,
  previewResultMaterial,
  selectedSelectedMaterial,
  submitSelectedMaterialCut,
  sourceMaterialClick,
  selectedMaterialClick,
  sourceMaterialDoubleClick,
  selectedMaterialDoubleClick,
  submitSourceMaterialCut,
  previewResultMaterialClick,

  allowToUse,

  sourceMaterialContextMenuItems,
  selectedMaterialContextMenuItems,
  previewResultMaterialContextMenuItems
} = useMaterialTransformation(props.type, props.materials)

</script>

<template>
  <div class="flex flex-col h-full">
    <div
        class="grid gap-4 flex-1 min-h-0"
        :class="{'grid-cols-2': type === 1, 'grid-cols-3': type !== 1}"
    >
      <ui-card
          title="Доступные материалы"
          documentation-key="available-transformation-materials"
      >
        <ListMaterial
            :materials="filteredMaterials"
            enable-search
            @item-click="sourceMaterialClick"
            @item-double-click="sourceMaterialDoubleClick"
            mark-changed
            enable-context-menu
            :context-menu-options="sourceMaterialContextMenuItems"
            :item-disabled="item => item.isZeroed || !allowToUse(item)"
            :item-type="item => item.isChanged ? 'success' : undefined"
        />
      </ui-card>

      <ui-card :title="type === 1 ? 'Результат' : 'Выбранные материалы'">
        <template v-if="previewResultMaterial">
          <div class="p-1">
            <CardMaterial
                :material="previewResultMaterial"
                :context-menu-options="previewResultMaterialContextMenuItems"
                @click="previewResultMaterialClick"
                enable-context-menu
            />
          </div>
          <p
              v-if="type === 2"
              class="italic text-sm text-gray-500 mt-2"
          >
            Нажмите на карточку результата для редактирования
          </p>
          <n-divider/>
        </template>

        <ListMaterial
            :materials="selectedMaterials"
            @item-click="selectedMaterialClick"
            @item-double-click="selectedMaterialDoubleClick"
            enable-context-menu
            :context-menu-options="selectedMaterialContextMenuItems"
        />
      </ui-card>
    </div>
  </div>

  <ModalMaterialCut
      v-model:show="showSourceMaterialCutFormModal"
      :split-mode="materialCutFormModeIsSplit"
      :material="selectedSourceMaterial as Material"
      @cut-confirmed="submitSourceMaterialCut"
  />

  <ModalMaterialCut
      v-model:show="showSelectedMaterialCutFormModal"
      :split-mode="materialCutFormModeIsSplit"
      :material="selectedSelectedMaterial as Material"
      @cut-confirmed="submitSelectedMaterialCut"
  />

  <ModalTransformationResultMaterialSettings
      v-model:show="showResultMaterialSettingsModal"
      :material="selectedResultMaterial"
  />

</template>