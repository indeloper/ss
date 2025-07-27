<script setup lang="ts">
import { useMaterialLibraryStore } from '~/stores/materialLibrary'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import TableMaterialStandard from '~/components/table/MaterialStandard.vue'

definePageMeta({
  layout: 'authenticated',
  middleware: ['$auth']
})

const materialLibraryStore = useMaterialLibraryStore()
const { standards } = storeToRefs(materialLibraryStore)

onMounted(() => {
  // Загрузить данные, если они еще не загружены
  if (!standards.value) {
    materialLibraryStore.loadAll()
  }
})
</script>

<template>
  <ui-card title="Стандарты материалов" class="w-full">
    <TableMaterialStandard :standards/>
  </ui-card>

</template>

<style scoped>

</style>
