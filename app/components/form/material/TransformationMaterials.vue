<script
    lang="ts"
    setup
>
import type {MaterialCollection} from "~/models/collections/MaterialCollection";

const props = defineProps<{
  type: number,
  materials: MaterialCollection
}>()
</script>

<template>
  <template v-if="type === 1">
    <FormMaterialTransformationCutMaterials :materials="materials"/>
  </template>
  <template v-if="type === 2">
    <FormMaterialTransformationJoinMaterials :materials="materials"/>
  </template>
</template>