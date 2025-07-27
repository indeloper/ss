<script
    setup
    lang="ts"
>

import type {MenuOption} from "naive-ui";

const {logout} = useSanctum()

const handleLogout = async () => {
  await logout()
  navigateTo('/login')
}

const menuOptions: MenuOption[] = [
  {
    type: 'group',
    label: 'Строительство',
    key: '/building',
    children: [
      {
        label: 'Материалы',
        key: '/building/materials',
        children: [
          {
            label: 'Поиск',
            key: '/building/material/search',
          },
          {
            label: 'Учет',
            key: '/building/material/accounting'
          }
        ]
      },
    ]
  },
  {
    type: 'group',
    label: 'Справочники',
    key: '/library',
    children: [
      {
        label: 'Материалы',
        key: '/library/material',
        children: [
          {
            label: 'Типы материалов',
            key: '/library/material/type',
          },
        ]
      },
    ]
  },
]

const handleNavigate = (data: string) => {
  navigateTo(data)
}

</script>

<template>
  <div class="min-h-screen relative bg-gray-100">
    <n-layout
        position="absolute"
    >
      <n-layout-header bordered>
        <n-card :content-style="{padding: 0}">
          <div class="flex justify-between p-2">
            <img
                src="/images/logo.png"
                alt=""
                width="180px"
            >
            <n-button @click="handleLogout">logout</n-button>
          </div>
        </n-card>


      </n-layout-header>
      <n-layout
          has-sider
          position="absolute"
          style="top: 52px;"
          class="!bg-red-100"
      >
        <n-layout-sider
            bordered
            collapse-mode="transform"
            show-trigger="arrow-circle"
            class="!bg-gray-100 !p-4"
        >
          <n-card class="h-full">
            <n-menu
                class="!bg-white"
                :collapsed-width="64"
                :collapsed-icon-size="22"
                :options="menuOptions"
                @update:value="handleNavigate"
            />
          </n-card>
          <!--          <div class="w-full min-h-full bg-white rounded p-4 shadow">-->
          <!--            -->
          <!--          </div>-->
        </n-layout-sider>
        <n-layout class="!bg-gray-100 !p-4 !flex !flex-col">
          <div class="w-full min-h-full flex-1 flex">
            <slot/>
          </div>
        </n-layout>
      </n-layout>
    </n-layout>
  </div>
</template>

<style scoped>

</style>