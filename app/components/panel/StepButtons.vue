<script
    setup
    lang="ts"
>

const step = defineModel<number>('step', {required: true})

const emit = defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'submit'): void
}>()

const props = defineProps<{
  lastStep: number
}>()

const isLastStep = computed(() => {
  return step.value === props.lastStep
})

</script>

<template>
  <div class="flex w-full justify-between items-center">
    <n-button type="primary" @click="emit('prev')">Назад</n-button>
    <n-button
        v-if="!isLastStep"
        type="primary"
        @click="emit('next')"
    >
      Далее
    </n-button>
    <n-button
        v-if="isLastStep"
        type="primary"
        @click="emit('submit')"
    >
      Подтвердить
    </n-button>
  </div>
</template>

<style scoped>

</style>