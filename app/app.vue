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
