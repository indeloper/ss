<script
    setup
    lang="ts"
>
import type {MaterialCollection} from "~/models/collections/MaterialCollection";
import type {ProjectObject} from "~/models/ProjectObject";
import {TRANSFORMATION_TYPES} from "~/constants/transformationTypes";
import {ref} from "vue";

const props = defineProps<{
  type: number,
  materials: MaterialCollection,
  resultMaterials: MaterialCollection,
  projectObject: ProjectObject,
  comment: string,
  departureAt: Date,
}>()

const transformationTypes = ref(TRANSFORMATION_TYPES)
</script>

<template>
  <p class="font-medium text-xl mb-4">Подтверждение изготовления</p>
  <div class=" grid grid-cols-3 gap-4">
    <!--    <div class="col-span-3">-->
    <!--      <p class="font-medium mb-4">Результат</p>-->
    <!--      <TableMaterial :materials="resultMaterials"/>-->
    <!--    </div>-->
    <!--    <n-divider class="col-span-3"/>-->
    <div class="col-span-3">
      <p class="font-medium text-base mb-4">Изменения материалов</p>
      <n-collapse :default-expanded-names="['new']">
        <n-collapse-item
            title="Новые материалы"
            name="new"
        >
          <TableMaterial :materials="resultMaterials"/>
        </n-collapse-item>
        <n-collapse-item
            title="Изменённые материалы"
            name="changed"
        >
          <TableMaterial
              :materials="materials.filterChanged()"
              show-initials
          />
        </n-collapse-item>
      </n-collapse>
    </div>
    <n-divider class="col-span-3"/>
    <div class="col-span-2">
      <p class="font-medium mb-4">Параметры</p>
      <div class="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
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
          <p class="font-medium text-gray-500">Тип:</p>
          <p class="font-medium">{{ transformationTypes.find(item => item.value === props.type)?.label }}</p>
        </div>

        <div v-if="comment" class="col-span-2">
          <p class="font-medium text-gray-500">Комментарий:</p>
          <p class="font-medium">{{ comment }}</p>
        </div>
      </div>
    </div>
    <div class="">
      <p class="font-medium mb-4">Сводка</p>
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex w-full flex-col gap-2">

          <div class="flex flex-col">
            <p class="font-medium text-gray-500">Всего позиций:</p>
            <p class="font-bold">{{ resultMaterials.getCount() }}</p>
          </div>

          <div class="flex flex-col">
            <p class="font-medium text-gray-500">Объем по типам:</p>
            <div>
              <p v-for="type in resultMaterials.getGroupedAmountQuantityByType()">
                <span class="font-bold">{{ type.type }}</span>: {{ type.total }} {{ type.unit }}
              </p>
            </div>

          </div>

          <div class="flex flex-col">
            <p class="font-medium text-gray-500">Всего штук:</p>
            <p class="font-bold">{{ resultMaterials.getTotalAmount() }} шт.</p>
          </div>

          <n-divider/>

          <div class="flex justify-between">
            <p class="font-bold text-gray-500 text-xl">Общий вес:</p>
            <p class="font-bold text-xl">{{ resultMaterials.getTotalWeight() }} т.</p>
          </div>
        </div>
      </div>
    </div>

  </div>

</template>

<style scoped>

</style>