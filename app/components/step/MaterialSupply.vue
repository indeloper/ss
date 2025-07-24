<script
    setup
    lang="ts"
>
const step = defineModel<number>('step', {required: true})
</script>

<template>
  <n-steps
      :current="step as number"
      size="small"
  >
    <n-step
        title="Выбор материалов"
    />
    <n-step
        title="Указание параметров"
    />
    <n-step
        title="Подтверждение"
    />
  </n-steps>
</template>

<style scoped>

</style>