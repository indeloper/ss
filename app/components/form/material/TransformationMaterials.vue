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
  showSourceMaterialCutFormModal,
  materialCutFormModeIsSplit,
  selectedMaterials,
  previewResultMaterial,

  sourceMaterialClick,
  selectedMaterialClick,
  sourceMaterialDoubleClick,
  selectedMaterialDoubleClick,
  submitSourceMaterialCut,

  sourceMaterialContextMenuItems,
  selectedMaterialContextMenuItems
} = useMaterialTransformation(props.type, props.materials)

</script>

<template>
  <div class="flex flex-col h-full">
    <div class="grid grid-cols-3 gap-4 flex-1 min-h-0">
      <ui-card title="Доступные материалы">
        <ListMaterial
            :materials="filteredMaterials"
            enable-search
            @item-click="sourceMaterialClick"
            @item-double-click="sourceMaterialDoubleClick"
            mark-changed
            enable-context-menu
            :context-menu-options="sourceMaterialContextMenuItems"
            :item-disabled="item => item.isZeroed"
        />
      </ui-card>

      <ui-card title="Выбранные материалы">
        <template v-if="previewResultMaterial">
          <div class="p-1">
            <CardMaterial :material="previewResultMaterial"/>
          </div>
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

</template>