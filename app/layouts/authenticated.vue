<script
    setup
    lang="ts"
>

import type {MenuOption} from "naive-ui";
import {Readme} from '@vicons/fa'

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
          {
            label: 'Свойства материалов',
            key: '/library/material/property',
          },
          {
            label: 'Бренды материалов',
            key: '/library/material/brand',
          },
          {
            label: 'Стандарты материалов',
            key: '/library/material/standard',
          },
        ]
      },
    ]
  },
]

const handleNavigate = (data: string) => {
  navigateTo(data)
}

const showDocsModal = ref(false)

</script>

<template>
  <div class="min-h-screen relative bg-gray-100">
<!--    <div-->
<!--        @click="showDocsModal = !showDocsModal"-->
<!--        class="z-[9999] animate-pulse w-12 rounded-full h-12 bg-yellow-200 shadow-lg border border-yellow-100 cursor-pointer hover:bg-yellow-300 transition-all absolute bottom-2 left-2 flex items-center justify-center"-->
<!--    >-->
<!--      <n-icon size="24">-->
<!--        <Readme/>-->
<!--      </n-icon>-->
<!--    </div>-->
    <n-layout
        position="absolute"
    >
      <n-layout-header bordered>
        <n-card :content-style="{padding: 0}">
          <div class="flex justify-between p-2">
            <div class="flex items-center">
              <div class="px-10 border-r border-gray-200 mr-4">
                <img
                    src="/images/logo.png"
                    alt=""
                    width="175px"
                >
              </div>
              <n-button
                  quaternary
                  @click="showDocsModal = !showDocsModal"
              >
                <template #icon>
                  <n-icon>
                    <Readme/>
                  </n-icon>
                </template>

                Документация
              </n-button>
            </div>


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

  <n-modal v-model:show="showDocsModal">
    <ui-card
        title="Документация"
        class="w-[70vw] min-h-[80vh]"
    >
      <pre>
      {{ $route.meta.docsKey }}

      </pre>
    </ui-card>
  </n-modal>
</template>

<style scoped>

</style>