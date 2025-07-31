<script
    setup
    lang="ts"
>
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
const { types } = storeToRefs(materialLibraryStore)

onMounted(() => {
  if (!types.value) {
    materialLibraryStore.loadAll()
  }
})
</script>

<template>
  <ui-card title="Типы материалов" class="w-full">
    <TableMaterialType :types />
  </ui-card>
</template>

<style scoped>

</style>