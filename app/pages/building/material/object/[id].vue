<script
    setup
    lang="ts"
>
import {useMaterialsStore} from "~/stores/useMaterialsStore";

definePageMeta({
  layout: 'authenticated',
  middleware: ['$auth']
})

const route = useRoute()

const materialStore = useMaterialsStore()

const {activeMaterials, reserveMaterials, loading: activeMaterialsLoading} = storeToRefs(materialStore)

onBeforeMount(async () => {
  await materialStore.loadMaterialsByProjectObject(Number(route.params.id))
  console.log(activeMaterials.value)
})

const selectedKeys = ref<(string | number)[]>([])

const handleSelectionChange = (keys: (string | number)[]) => {
  selectedKeys.value = keys
}

const handleMaterialUpdate = (material: any, field: string, value: number) => {
  console.log('Material updated:', {
    materialId: material.id,
    field,
    value,
    oldValue: material[field]
  })
}
</script>

<template>
  <div>




  </div>
</template>

<style scoped>

</style>