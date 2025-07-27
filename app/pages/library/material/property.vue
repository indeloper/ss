<script setup lang="ts">
definePageMeta({
  layout: 'authenticated',
  middleware: ['$auth']
})
</script>

<template>
    <TableMaterialProperty />
</template>

<style scoped>

</style>
