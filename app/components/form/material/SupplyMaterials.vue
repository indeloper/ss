<script
    setup
    lang="ts"
>

import type {MaterialCollection} from "~/models/collections/MaterialCollection";
import type {MaterialStandardCollection} from "~/models/collections/MaterialStandardCollection";
import {Material} from "~/models/Material";
import {FormStatus} from "~/enumerates/FormStatus";

const status = defineModel('status')
const statusMessage = defineModel('statusMessage')

const materials = defineModel<MaterialCollection>('materials', {
  required: true
})

const props = defineProps<{
  standards: MaterialStandardCollection,
}>()

const handleMaterialStandardRowClick = (uuid: string) => {

  const materialStandard = props.standards.findByUuid(uuid)

  if (!materialStandard) return

  materials.value.createAndAddFromStandard(materialStandard)
}

const handleUpdateMaterial = (material: Material, field: string, value: number) => {
  if (material.uuid && materials.value?.updateByUuid) {
    materials.value.updateByUuid(material.uuid, (mat) => {
      (mat as any)[field] = value
    })
  } else if (materials.value?.updateById) {
    materials.value.updateById(material.id, (mat) => {
      (mat as any)[field] = value
    })
  } else {
    (material as any)[field] = value
  }
}

const handleDeleteMaterial = (material: Material) => {
  materials.value.removeByUuid(material.uuid)
}

const validated = computed(() => {
  return materials.value.allHavePositiveQuantityAndAmount() && !materials.value.isEmpty()
})

defineExpose({
  validated
})

</script>

<template>
  <div class="flex flex-col h-full">
    <div class="grid grid-cols-3 gap-4 flex-1 min-h-0">
      <div class="flex flex-col overflow-hidden">
        <div class="flex-shrink-0 mb-2">
          <p class="font-medium">Выберите материал</p>
        </div>
        <ListMaterialStandard
            :material-standards="standards"
            @item-click="handleMaterialStandardRowClick"
            class="flex-1 overflow-hidden"
        />
      </div>

      <div class="col-span-2 flex flex-col overflow-hidden">
        <div class="flex-shrink-0 mb-2">
          <p class="font-medium">Укажите параметры</p>
        </div>
        <div class="flex-1 overflow-hidden">
          <TableMaterial
              enable-search
              :materials="materials"
              enable-editing
              edit-mode="create"
              @update:material="handleUpdateMaterial"
              enable-delete
              @delete:material="handleDeleteMaterial"
              class="h-full"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>