<script
    setup
    lang="ts"
>
import type {MaterialCollection} from "~/models/collections/MaterialCollection";
import type {ProjectObject} from "~/models/ProjectObject";

const props = defineProps<{
  materials: MaterialCollection,
  projectObject: ProjectObject,
  reason: string,
  contractor: string,
  ttn: string,
  comment: string,
  departureAt: Date,
  files: File[],
}>()
</script>

<template>
  <p class="font-medium text-xl mb-4">Подтверждение поставки</p>
  <div class=" grid grid-cols-3 gap-4">
    <div class="col-span-3">
      <p class="font-medium mb-4">Материалы</p>
      <TableMaterial :materials="materials" enable-grouping/>
    </div>
    <n-divider class="col-span-3"/>
    <div class="col-span-2">
      <p class="font-medium mb-4">Параметры</p>
      <div class="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
        <div>
          <p class="font-medium text-gray-500">Объект:</p>
          <p class="font-medium">{{ projectObject.getShortName() }}</p>
          <p class="text-gray-500 text-sm italic">{{ projectObject.getLocation() }}</p>
        </div>

        <div>
          <p class="font-medium text-gray-500">Ответственный:</p>
          <p class="font-medium">{{ useSanctum().user.value.user_full_name }}</p>
        </div>

        <div>
          <p class="font-medium text-gray-500">Дата:</p>
          <p class="font-medium">{{ new Date(departureAt).toLocaleDateString() }}</p>
        </div>

        <div>
          <p class="font-medium text-gray-500">Причина:</p>
          <p class="font-medium">{{ reason }}</p>
        </div>

        <div>
          <p class="font-medium text-gray-500">Поставщик:</p>
          <p class="font-medium">{{ contractor }}</p>
        </div>

        <div>
          <p class="font-medium text-gray-500">Номер накладной:</p>
          <p class="font-medium">{{ ttn }}</p>
        </div>

        <div v-if="comment">
          <p class="font-medium text-gray-500">Комментарий:</p>
          <p class="font-medium">{{ comment }}</p>
        </div>

        <div v-if="files.length" class="col-span-3">
          <p class="font-medium text-gray-500">Документы:</p>
          <UiFileView :files="files" :cols="3" />
        </div>


      </div>
    </div>
    <div class="">
      <p class="font-medium mb-4">Сводка</p>
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex w-full flex-col gap-2">

          <div class="flex flex-col">
            <p class="font-medium text-gray-500">Всего позиций:</p>
            <p class="font-bold">{{ materials.getCount() }}</p>
          </div>

          <div class="flex flex-col">
            <p class="font-medium text-gray-500">Объем по типам:</p>
            <div>
              <p v-for="type in materials.getGroupedAmountQuantityByType()">
                <span class="font-bold">{{ type.type }}</span>: {{ type.total }} {{ type.unit }}
              </p>
            </div>

          </div>

          <div class="flex flex-col">
            <p class="font-medium text-gray-500">Всего штук:</p>
            <p class="font-bold">{{ materials.getTotalAmount() }} шт.</p>
          </div>

          <n-divider/>

          <div class="flex justify-between">
            <p class="font-bold text-gray-500 text-xl">Общий вес:</p>
            <p class="font-bold text-xl">{{ materials.getTotalWeight() }} т.</p>
          </div>
        </div>
      </div>
    </div>

  </div>

</template>

<style scoped>

</style>