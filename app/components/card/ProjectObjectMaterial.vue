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
  <n-card title="Материалы">
    <n-tabs type="segment" animated>
      <n-tab-pane name="active" tab="На объекте">
        <TableMaterial
            :materials="activeMaterials"
            :loading
            enable-filtering
            enable-grouping
            enable-sorting
            :expand-groups-by-default="false"
        />
      </n-tab-pane>
      <n-tab-pane name="reserve" tab="В резерве">
        <TableMaterial
            :materials="reserveMaterials"
            :loading
            enable-filtering
            enable-grouping
            enable-sorting
            :expand-groups-by-default="false"
        />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<style scoped>

</style>