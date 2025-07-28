<script
    setup
    lang="ts"
>
import {useProjectObjectsStore} from '~/stores/projectObjects';
import {useMaterialLibraryStore} from "~/stores/materialLibrary";
import {definePageMeta, useMaterialsStore} from "#imports";
import {ref, computed, onMounted} from 'vue'
import {storeToRefs} from 'pinia'
import type {MenuOption} from "naive-ui";
import TRANSFORMATION_TYPES from "~/constants/transformationTypes";

const loadingBar = useLoadingBar()

definePageMeta({
  layout: 'authenticated',
  middleware: ['$auth'],
})

const objectsStore = useProjectObjectsStore()
const materialLibraryStore = useMaterialLibraryStore()
const materialStore = useMaterialsStore()
const contractorsStore = useContractorsStore()
const operationReasonsStore = useOperationReasonsStore()

const {
  activeMaterials,
  reserveMaterials,
  loading: materialsLoading
} = storeToRefs(materialStore)

const {
  projectObjects,
  loading: projectObjectsLoading,
  selectedProjectObject
} = storeToRefs(objectsStore)

const showSupplyDrawer = ref(false)
const showTransformationDrawer = ref(false)

const selectedTransformationType = ref(1)

onBeforeMount(async () => {
  loadingBar.start()
  materialLibraryStore.loadAll()
  await objectsStore.fetchObjects()
  objectsStore.initSelectedObject?.()
  contractorsStore.loadContractors()
  operationReasonsStore.loadSupplyReasons()
  loadingBar.finish()
})

watch(
    () => selectedProjectObject.value,
    async (newValue) => {
      if (newValue) {
        loadingBar.start()
        await materialStore.loadMaterialsByProjectObject(Number(newValue.id))
        loadingBar.finish()
      }
    }
)

const activeKey = ref('materials')
const menuOptions = computed<MenuOption[]>(() => {
  return [
    {
      label: 'Материалы',
      key: 'materials',
      disabled: materialsLoading.value || projectObjectsLoading.value,
      onClick: () => {
        alert()
      }
    },
    {
      label: 'Изготовление',
      key: 'transformation',
      disabled: materialsLoading.value || projectObjectsLoading.value,
      children: TRANSFORMATION_TYPES.map(type => ({
        label: () => {
          return h('p', {
            onClick: () => {
              showTransformationDrawer.value = true
              selectedTransformationType.value = type.value
            }
          }, {
            default: () => type.label
          })
        },
        key: type.key,
        disabled: type.disabled
      }))
    },
    {
      label: 'Движение',
      key: 'move',
      disabled: materialsLoading.value || projectObjectsLoading.value,
      children: [
        {
          label: () => {
            return h('p', {
              onClick: () => {
                showSupplyDrawer.value = true
              }
            }, {
              default: () => 'Поставка'
            })
          },
          key: 'supply',
        },
        {
          label: 'Перемещение',
          key: 'transfer',
        },
        {
          label: 'Списание',
          key: 'write-off',
        },
      ],
    },
  ]
})

</script>

<template>
  <div class="flex flex-col flex-1 w-full gap-4">
    <CardSelectableProjectObject
        @select="objectsStore.setSelectedProjectObject"
        :loading="projectObjectsLoading || materialsLoading"
        :project-objects="projectObjects.getAll()"
        :selected-project-object="selectedProjectObject"
    >
      <n-card content-style="padding: 0;">
        <n-menu
            v-model:value="activeKey"
            mode="horizontal"
            :options="menuOptions"
            responsive
        />
      </n-card>
    </CardSelectableProjectObject>

    <CardProjectObjectMaterial
        class="min-h-screen"
        :active-materials="activeMaterials"
        :reserve-materials="reserveMaterials"
        :loading="materialsLoading || projectObjectsLoading"
    />
  </div>

  <DrawerMaterialSupply v-model:show="showSupplyDrawer"/>
  <DrawerMaterialTransformation
      v-model:show="showTransformationDrawer"
      :transformation-type="selectedTransformationType"
  />

  <n-drawer

      placement="left"
      width="90vw"
  >
    <n-drawer-content title="Поставка">
      <CardMaterialSupply/>
    </n-drawer-content>
  </n-drawer>

</template>

<style scoped>
/* Стили уже подключены через Tailwind CSS */
</style>