<script
    setup
    lang="ts"
>
definePageMeta({
  layout: 'public',
  middleware: ['$guest']
})

const loading = ref(false)

const email = ref('')
const password = ref('')

const {login} = useSanctum()

const handleLogin = async () => {

  loading.value = true

  await login({
    email: email.value,
    password: password.value
  }).then(() => {
    loading.value = false
    navigateTo('/')
  })
}

</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <div class="flex flex-col gap-2 w-[30vw]">
      <p class="font-bold text-2xl">Вход в систему</p>
      <form
          @submit.prevent="handleLogin"
          class="flex flex-col gap-2"
      >
        <n-input
            placeholder="Email"
            name="email"
            v-model:value="email"
        />
        <n-input
            type="password"
            placeholder="Пароль"
            name="password"
            v-model:value="password"
        />
        <n-button
            type="primary"
            attr-type="submit"
        >Войти
        </n-button>
      </form>

    </div>
  </div>
</template>

<style scoped>

</style>