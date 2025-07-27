<script
    setup
    lang="ts"
>
definePageMeta({
  layout: 'authenticated',
  middleware: ['$auth']
})
</script>

<template>
  <TableMaterialType/>
</template>

<style scoped>

</style>