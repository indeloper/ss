<script setup lang="ts">
import { useMaterialLibraryStore } from '~/stores/materialLibrary'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { Plus } from '@vicons/fa'

definePageMeta({
  layout: 'authenticated',
  middleware: ['$auth']
})

const materialLibraryStore = useMaterialLibraryStore()
const { brands } = storeToRefs(materialLibraryStore)

const tableRef = ref()

onMounted(() => {
  if (!brands.value) {
    materialLibraryStore.loadAll()
  }
})

const handleCreate = () => {
  tableRef.value?.handleCreate()
}
</script>

<template>
  <ui-card title="Бренды материалов" class="w-full">
    <TableMaterialBrand :brands/>
  </ui-card>
</template>

<style scoped>

</style>
