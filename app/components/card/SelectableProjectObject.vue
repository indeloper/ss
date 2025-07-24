<script
    setup
    lang="ts"
>

import type {ProjectObject} from "~/models/ProjectObject";
import {ExchangeAlt} from "@vicons/fa";
const emit = defineEmits<{
  (e: 'select', id: number): void
}>()

const props = defineProps<{
  loading: boolean,
  selectedProjectObject?: ProjectObject | null,
  projectObjects: ProjectObject[]
}>()

const showObjectModal = ref<boolean>(false)
const search = ref<string>('')

const filteredProjectObjects = computed(() => {
  return props.projectObjects.filter((po: ProjectObject) => po.getShortName().toLowerCase().includes(search.value.toLowerCase()) || po.getLocation().toLowerCase().includes(search.value.toLowerCase()))
})

const handleSelectObject = (id: number) => {
  emit('select', id)
  showObjectModal.value = false
  search.value = ''
}

</script>

<template>
  <n-card>
    <template #header-extra>
      <n-button
          @click="showObjectModal = true"
          :loading
      >
        <template #icon>
          <n-icon><ExchangeAlt/></n-icon>
        </template>
        {{ selectedProjectObject ? 'Сменить объект' : 'Выбрать объект' }}
      </n-button>
    </template>
    <template #header>
      <n-skeleton
          v-if="loading"
          text
          width="60%"
      />
      <p v-else>{{ selectedProjectObject ? selectedProjectObject.getShortName() : 'Объект не выбран' }}</p>
    </template>

<!--    <n-skeleton-->
<!--        v-if="loading"-->
<!--        text-->
<!--        :repeat="1"-->
<!--    />-->
<!--    <p v-else>{{-->
<!--        selectedProjectObject && selectedProjectObject.getLocation() ? selectedProjectObject.getLocation() : ''-->
<!--      }}</p>-->
    <slot/>
  </n-card>

  <n-modal
      v-model:show="showObjectModal"
      preset="card"
      title="Выбор объекта"
      class="max-w-[70vw] min-h-[80vh]"
  >
    <n-input
        placeholder="Поиск"
        v-model:value="search"
        autofocus
    />
    <n-divider/>
    <n-scrollbar style="max-height: 60vh">
      <n-card
          v-for="projectObject in filteredProjectObjects"
          :key="projectObject.getId()"
          :title="projectObject.getShortName()"
          @click="handleSelectObject(projectObject.getId())"
          hoverable
          class="mb-4 cursor-pointer"
      >
        <p>{{ projectObject.getLocation() }}</p>
      </n-card>
    </n-scrollbar>
  </n-modal>

</template>

<style scoped>

</style>