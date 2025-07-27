<script
    setup
    lang="ts"
>
import type {Material} from "~/models/Material";
import type {MaterialCollection} from "~/models/collections/MaterialCollection";

const props = defineProps<{
  material: Material,
  selectedMaterials: MaterialCollection,
}>()

interface JoinGroup {
  materials: Material[]
  totalLength: number
  jointsCount: number
}

interface JoinVariant {
  groups: JoinGroup[]
  totalJoints: number
  description: string
}

// Функция для генерации всех возможных разбиений массива на группы минимум по 2 элемента
const generatePartitions = (materials: Material[]): Material[][][] => {
  const results: Material[][][] = []

  const backtrack = (currentPartition: Material[][], remainingMaterials: Material[]) => {
    if (remainingMaterials.length === 0) {
      // Проверяем, что все группы содержат минимум 2 материала
      if (currentPartition.every(group => group.length >= 2)) {
        results.push([...currentPartition.map(group => [...group])])
      }
      return
    }

    if (remainingMaterials.length === 1) {
      // Если остался 1 материал, добавляем его к существующим группам
      for (let i = 0; i < currentPartition.length; i++) {
        const newPartition = currentPartition.map((group, idx) =>
            idx === i ? [...group, remainingMaterials[0]] : [...group]
        )
        backtrack(newPartition, [])
      }
      return
    }

    const [first, ...rest] = remainingMaterials

    // Добавляем материал к существующим группам
    for (let i = 0; i < currentPartition.length; i++) {
      const newPartition = currentPartition.map((group, idx) =>
          idx === i ? [...group, first] : [...group]
      )
      backtrack(newPartition, rest)
    }

    // Создаем новую группу с этим материалом (если остается достаточно материалов)
    if (rest.length >= 1) {
      backtrack([...currentPartition, [first]], rest)
    }
  }

  const materials_array = materials
  if (materials_array.length >= 2) {
    backtrack([[materials_array[0]]], materials_array.slice(1))
  }

  return results
}

// Вычисляем все возможные варианты стыковки
const joinVariants = computed<JoinVariant[]>(() => {
  const materials = props.selectedMaterials.getAll()
  if (materials.length < 2) return []

  const partitions = generatePartitions(materials)
  const variants: JoinVariant[] = []

  partitions.forEach((partition, index) => {
    const groups: JoinGroup[] = partition.map(groupMaterials => {
      const totalLength = groupMaterials.reduce((sum, mat) => sum + mat.quantity, 0)
      const jointsCount = groupMaterials.length - 1

      return {
        materials: groupMaterials,
        totalLength,
        jointsCount
      }
    })

    const totalJoints = groups.reduce((sum, group) => sum + group.jointsCount, 0)

    const description = groups
        .map(group => `${group.materials.map(m => `${m.quantity}м`).join('+')} = ${group.totalLength}м`)
        .join(' | ')

    variants.push({
      groups,
      totalJoints,
      description
    })
  })

  // Сортируем по общему количеству стыков (по возрастанию)
  return variants.sort((a, b) => a.totalJoints - b.totalJoints)
})

// Для отладки - выводим материалы
const materialLengths = computed(() => {
  return props.selectedMaterials.getAll().map(m => `${m.quantity}м`).join(', ')
})

// Слайдер для выбора варианта стыковки
const selectedLength = ref(0)

// Создаем метки для слайдера на основе вариантов
const uniqueLengths = computed(() => {
  const uniqueLengths = Array.from(new Set(joinVariants.value.flatMap(variant => variant.groups.map(group => group.totalLength)))).sort((a, b) => a - b)
  return uniqueLengths
})

const sliderMarks = computed(() => {
  const marks: Record<number, string> = {}

  uniqueLengths.value.forEach((length, index) => {
    marks[index] = `${length}м`
  })

  return marks
})

// Выбранный вариант
const selectedVariant = computed(() => {
  const selectedLengthValue = uniqueLengths.value[selectedLength.value]
  return joinVariants.value.find(variant => variant.groups.some(group => group.totalLength === selectedLengthValue)) || null
})

// Группировка вариантов по количеству результирующих единиц
const variantsByGroupCount = computed(() => {
  const grouped: Record<number, JoinVariant[]> = {}

  joinVariants.value.forEach(variant => {
    const groupCount = variant.groups.length
    if (!grouped[groupCount]) {
      grouped[groupCount] = []
    }
    grouped[groupCount].push(variant)
  })

  return grouped
})

// Получаем отсортированные ключи (количество групп)
const groupCounts = computed(() => {
  return Object.keys(variantsByGroupCount.value)
      .map(Number)
      .sort((a, b) => a - b)
})
</script>

<template>
  <div class="p-4">
    <h3 class="text-lg font-semibold mb-4">Настройка результата стыковки</h3>

    <div class="mb-4">
      <p class="text-sm text-gray-600 mb-2">
        Материалы для стыковки: {{ materialLengths }}
      </p>
      <p class="text-sm text-gray-600">
        Общая длина: {{ props.selectedMaterials.getAll().reduce((sum, m) => sum + m.quantity, 0) }}м
      </p>
    </div>

    <div class="space-y-3">
      <h4 class="font-medium">Возможные варианты стыковки:</h4>

      <div
          v-if="joinVariants.length === 0"
          class="text-gray-500 italic"
      >
        Недостаточно материалов для стыковки (минимум 2)
      </div>

      <n-tabs
          type="line"
          :default-value="groupCounts[0]"
      >
        <n-tab-pane
            v-for="groupCount in groupCounts"
            :key="groupCount"
            :name="groupCount"
            :tab="`${groupCount} результирующих материала`"
        >
          <div class="grid grid-cols-2 gap-4">
            <div
                v-for="(variant, index) in variantsByGroupCount[groupCount]"
                :key="index"
                class="border rounded-lg p-3 hover:bg-gray-50"
            >
              <div class="flex justify-between items-start mb-2">
                <span class="font-medium">Вариант {{ index + 1 }}</span>
                <span class="text-sm text-gray-600">
                Всего стыков: {{ variant.totalJoints }}
              </span>
              </div>

              <div class="text-sm text-gray-700">
                {{ variant.description }}
              </div>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

<style scoped>

</style>