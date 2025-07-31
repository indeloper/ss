<script
    setup
    lang="ts"
>
import type {MaterialCollection} from "~/models/collections/MaterialCollection";

const props = defineProps<{
  activeMaterials: MaterialCollection,
  reserveMaterials: MaterialCollection,
  loading: boolean
}>()
</script>

<template>
  <ui-card title="Материалы" class="flex flex-col h-full">
    <n-tabs type="segment" animated class="flex flex-col h-full">
      <n-tab-pane name="active" tab="На объекте" :disabled="loading" class="flex flex-col h-full">
        <TableMaterial
            :materials="activeMaterials"
            :loading
            enable-filtering
            enable-grouping
            enable-sorting
            :expand-groups-by-default="false"
            class="flex-1"
        />
      </n-tab-pane>
      <n-tab-pane name="reserve" tab="В резерве" :disabled="loading" class="flex flex-col h-full">
        <TableMaterial
            :materials="reserveMaterials"
            :loading
            enable-filtering
            enable-grouping
            enable-sorting
            :expand-groups-by-default="false"
            class="flex-1"
        />
      </n-tab-pane>
    </n-tabs>
  </ui-card>
</template>

<style scoped>

</style>