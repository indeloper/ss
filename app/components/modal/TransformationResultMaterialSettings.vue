<script
    setup
    lang="ts"
>
import {Material} from "~/models/Material";

const show = defineModel<boolean>('show', {required: true})

const props = defineProps<{
  material: Material
}>()

const materialsLibraryStore = useMaterialLibraryStore()
const {standards} = storeToRefs(materialsLibraryStore)

const materialOppositeStandard = computed(() => {

  if (props.material.isJoined) {
    return standards.value.findNotJoinedOpposite(props.material.material_standard.id)
  }

  return standards.value.findJoinedOpposite(props.material.material_standard.id)
})

const materialOpposite = computed(() => {
  return Material
      .createFromStandard(materialOppositeStandard.value)
      .acceptValuesFromMaterial(props.material)
})

</script>

<template>
  <n-modal
      v-model:show="show"
      class="min-w-[60vw] min-h-[60vh]"
  >
    <ui-card title="Настройки результата">
      <div class="grid grid-cols-2">
        <div></div>
        <div class="p-1">
          <p class="font-medium mb-2">Заменить на:</p>
          <CardMaterial
              v-if="materialOpposite"
              :material="materialOpposite"
              @click="material.changeMaterialStandard(materialOppositeStandard)"
          />
        </div>
      </div>
    </ui-card>
  </n-modal>
</template>

<style scoped>

</style>