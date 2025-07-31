<script
    lang="ts"
    setup
>
import {NConfigProvider, NMessageProvider} from 'naive-ui'
import {ruRU, dateRuRU} from 'naive-ui'
import {useDocumentationStore} from "~/stores/documentation";

const documentationStore = useDocumentationStore()

const theme = {
  common: {
    primaryColor: '#001b41',
    primaryColorHover: '#003366',
    primaryColorPressed: '#004d99',
    primaryColorSuppl: '#001b41',
    errorColor: '#d10d2c',
    errorColorHover: '#e63946',
    errorColorPressed: '#f77f00',
    errorColorSuppl: '#d10d2c'
  }
}
</script>

<template>
  <div>
    <n-config-provider
        :locale="ruRU"
        :date-locale="dateRuRU"
        :theme-overrides="theme"
    >
      <n-modal-provider>
        <n-dialog-provider>
          <n-notification-provider>
            <n-message-provider>
              <n-loading-bar-provider>
                <NuxtLayout>
                  <NuxtPage/>
                </NuxtLayout>
              </n-loading-bar-provider>
            </n-message-provider>
          </n-notification-provider>
        </n-dialog-provider>
      </n-modal-provider>
    </n-config-provider>
  </div>

  <n-modal
      v-model:show="documentationStore.showDocumentation"
      class="w-[70vw] min-h-[80vh]"
      @close="documentationStore.close"
  >
    <ui-card>
      <UiDocumentation :documentation-key="documentationStore.documentationKey"/>
    </ui-card>
  </n-modal>
</template>
