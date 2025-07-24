<template>
  <div class="cache-manager">
    <n-card title="Управление кэшем IndexedDB" size="small">
      <template #header-extra>
        <n-space>
          <n-button 
            size="small" 
            type="primary" 
            @click="refreshStats"
            :loading="loading"
          >
            <template #icon>
              <n-icon><RefreshIcon /></n-icon>
            </template>
            Обновить
          </n-button>
          <n-button 
            size="small" 
            type="error" 
            @click="showClearDialog = true"
            :disabled="!cacheStats.supported || cacheStats.totalItems === 0"
          >
            <template #icon>
              <n-icon><TrashIcon /></n-icon>
            </template>
            Очистить всё
          </n-button>
        </n-space>
      </template>

      <div v-if="!cacheStats.supported" class="text-center py-4">
        <n-alert type="warning" title="IndexedDB не поддерживается">
          Ваш браузер не поддерживает IndexedDB или он отключен.
        </n-alert>
      </div>

      <div v-else>
        <!-- Общая статистика -->
        <n-descriptions :column="3" size="small" class="mb-4">
          <n-descriptions-item label="Всего элементов">
            <n-tag type="info">{{ cacheStats.totalItems }}</n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="Размер кэша">
            <n-tag type="success">{{ cacheStats.totalSize }}</n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="Статус">
            <n-tag :type="cacheStats.totalItems > 0 ? 'success' : 'default'">
              {{ cacheStats.totalItems > 0 ? 'Активен' : 'Пустой' }}
            </n-tag>
          </n-descriptions-item>
        </n-descriptions>

        <!-- Детальная статистика по коллекциям -->
        <n-data-table
          :columns="columns"
          :data="cacheStats.caches"
          :pagination="false"
          size="small"
          :bordered="false"
        />
      </div>
    </n-card>

    <!-- Диалог подтверждения очистки -->
    <n-modal 
      v-model:show="showClearDialog"
      preset="dialog"
      title="Подтверждение"
      content="Вы уверены, что хотите очистить весь кэш? Это действие нельзя отменить."
      positive-text="Очистить"
      negative-text="Отмена"
      @positive-click="clearAllCache"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCachedStore } from '~/composables/useCachedStore'
import { useMessage } from 'naive-ui'
import { Refresh as RefreshIcon, Trash as TrashIcon } from '@vicons/ionicons5'

const { getCacheStats, clearCache, clearSpecificCache } = useCachedStore()
const message = useMessage()

const loading = ref(false)
const showClearDialog = ref(false)
const cacheStats = ref({
  supported: false,
  totalItems: 0,
  totalSize: '0 B',
  caches: []
})

// Колонки для таблицы
const columns = computed(() => [
  {
    title: 'Тип данных',
    key: 'type',
    render: (row: any) => {
      const typeNames: Record<string, string> = {
        materials: 'Материалы',
        materialStandards: 'Стандарты материалов',
        materialBrands: 'Бренды материалов',
        materialProperties: 'Свойства материалов',
        materialTypes: 'Типы материалов',
        materialUnits: 'Единицы измерения',
        contractors: 'Подрядчики',
        operationReasons: 'Причины операций',
        projectObjects: 'Объекты проекта',
        users: 'Пользователи'
      }
      return typeNames[row.type] || row.type
    }
  },
  {
    title: 'Элементов',
    key: 'count',
    render: (row: any) => h('n-tag', { type: 'info', size: 'small' }, row.count)
  },
  {
    title: 'Последняя синхронизация',
    key: 'lastSync',
    render: (row: any) => {
      if (!row.lastSync) return 'Никогда'
      return new Date(row.lastSync).toLocaleString('ru-RU')
    }
  },
  {
    title: 'Статус',
    key: 'status',
    render: (row: any) => {
      if (row.isExpired) {
        return h('n-tag', { type: 'error', size: 'small' }, 'Устарел')
      }
      if (row.count > 0) {
        return h('n-tag', { type: 'success', size: 'small' }, 'Актуален')
      }
      return h('n-tag', { type: 'default', size: 'small' }, 'Пустой')
    }
  },
  {
    title: 'Действия',
    key: 'actions',
    render: (row: any) => {
      return h('n-button', {
        size: 'small',
        type: 'error',
        ghost: true,
        disabled: row.count === 0,
        onClick: () => clearCacheByType(row.type)
      }, 'Очистить')
    }
  }
])

// Загрузка статистики кэша
const refreshStats = async () => {
  loading.value = true
  try {
    cacheStats.value = await getCacheStats()
  } catch (error) {
    console.error('Error loading cache stats:', error)
    message.error('Ошибка загрузки статистики кэша')
  } finally {
    loading.value = false
  }
}

// Очистка всего кэша
const clearAllCache = async () => {
  loading.value = true
  try {
    await clearCache()
    await refreshStats()
    message.success('Кэш успешно очищен')
  } catch (error) {
    console.error('Error clearing cache:', error)
    message.error('Ошибка очистки кэша')
  } finally {
    loading.value = false
    showClearDialog.value = false
  }
}

// Очистка конкретного типа кэша
const clearCacheByType = async (type: string) => {
  try {
    await clearSpecificCache(type)
    await refreshStats()
    message.success(`Кэш ${type} успешно очищен`)
  } catch (error) {
    console.error(`Error clearing ${type} cache:`, error)
    message.error(`Ошибка очистки кэша ${type}`)
  }
}

onMounted(() => {
  refreshStats()
})
</script>

<style scoped>
.cache-manager {
  max-width: 800px;
}
</style>
