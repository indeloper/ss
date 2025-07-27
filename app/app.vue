<script>
import {NConfigProvider, NMessageProvider} from 'naive-ui'
import {ruRU, dateRuRU} from 'naive-ui'
import { createPinia } from 'pinia';

export default {
  components: {
    NConfigProvider
  },
  data() {
    return {
      ruRU,
      dateRuRU,
      theme: {
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
    };
  },
};

const pinia = createPinia()

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
          <n-message-provider>
            <n-loading-bar-provider>
              <NuxtLayout>
                <NuxtPage/>
              </NuxtLayout>
            </n-loading-bar-provider>
          </n-message-provider>
        </n-dialog-provider>
      </n-modal-provider>
    </n-config-provider>
  </div>
</template>
