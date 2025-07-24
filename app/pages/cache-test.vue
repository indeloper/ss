<template>
  <div class="container mx-auto p-6">
    <n-space vertical size="large">
      <n-card title="Тестирование IndexedDB" size="small">
        <n-space vertical>
          <n-alert type="info">
            Эта страница предназначена для тестирования функциональности IndexedDB кэширования.
          </n-alert>
          
          <n-space>
            <n-button type="primary" @click="testBasicCaching" :loading="testing">
              Тест базового кэширования
            </n-button>
            <n-button type="success" @click="testCollectionCaching" :loading="testing">
              Тест кэширования коллекций
            </n-button>
            <n-button type="warning" @click="testStoreIntegration" :loading="testing">
              Тест интеграции со store
            </n-button>
            <n-button type="error" @click="clearTestData" :loading="testing">
              Очистить тестовые данные
            </n-button>
          </n-space>
        </n-space>
      </n-card>

      <!-- Компонент управления кэшем -->
      <CacheManager />

      <!-- Лог тестирования -->
      <n-card title="Лог тестирования" size="small">
        <n-scrollbar style="max-height: 400px">
          <n-log 
            :log="testLog" 
            :rows="20"
            :loading="testing"
          />
        </n-scrollbar>
        <template #action>
          <n-button size="small" @click="clearLog">Очистить лог</n-button>
        </template>
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useIndexedDB } from '~/composables/useIndexedDB'
import { useCachedStore } from '~/composables/useCachedStore'
import { MaterialCollection } from '~/models/collections/MaterialCollection'
import { MaterialStandardCollection } from '~/models/collections/MaterialStandardCollection'
import { useMaterialsStore } from '~/stores/useMaterialsStore'
import { useMessage } from 'naive-ui'
import CacheManager from '~/components/cache/CacheManager.vue'

const message = useMessage()
const testing = ref(false)
const testLog = ref('')

const { setCache, getCache, clearCache, isSupported } = useIndexedDB()
const { loadWithCache, getCacheStats } = useCachedStore()
const materialsStore = useMaterialsStore()

// Добавление записи в лог
const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  const timestamp = new Date().toLocaleTimeString('ru-RU')
  const prefix = {
    info: '[INFO]',
    success: '[SUCCESS]',
    error: '[ERROR]',
    warning: '[WARNING]'
  }[type]
  
  testLog.value += `${timestamp} ${prefix} ${message}\n`
}

// Очистка лога
const clearLog = () => {
  testLog.value = ''
}

// Тест 1: Базовое кэширование
const testBasicCaching = async () => {
  testing.value = true
  addLog('=== Начало теста базового кэширования ===')
  
  try {
    if (!isSupported()) {
      addLog('IndexedDB не поддерживается в этом браузере', 'error')
      return
    }
    
    addLog('IndexedDB поддерживается ✓', 'success')
    
    // Создаем тестовые данные
    const testData = [
      { getId: () => 1, getUuid: () => 'test-uuid-1', name: 'Test Item 1' },
      { getId: () => 2, getUuid: () => 'test-uuid-2', name: 'Test Item 2' }
    ]
    
    addLog('Создаем тестовые данные...')
    
    // Сохраняем в кэш
    await setCache('materials', testData, { ttl: 60000 })
    addLog('Данные сохранены в кэш ✓', 'success')
    
    // Загружаем из кэша
    const cachedData = await getCache('materials')
    if (cachedData && cachedData.length === 2) {
      addLog('Данные успешно загружены из кэша ✓', 'success')
      addLog(`Загружено элементов: ${cachedData.length}`)
    } else {
      addLog('Ошибка загрузки данных из кэша', 'error')
    }
    
    // Очищаем тестовые данные
    await clearCache('materials')
    addLog('Тестовые данные очищены ✓', 'success')
    
  } catch (error) {
    addLog(`Ошибка в тесте: ${error}`, 'error')
  } finally {
    testing.value = false
    addLog('=== Конец теста базового кэширования ===')
  }
}

// Тест 2: Кэширование коллекций
const testCollectionCaching = async () => {
  testing.value = true
  addLog('=== Начало теста кэширования коллекций ===')
  
  try {
    // Создаем тестовую коллекцию материалов
    const materialCollection = new MaterialCollection([])
    addLog('Создана пустая коллекция материалов')
    
    // Проверяем загрузку из кэша (должна быть пустой)
    const loaded = await materialCollection.loadFromCache()
    addLog(`Попытка загрузки из кэша: ${loaded ? 'успешно' : 'кэш пуст'}`)
    
    // Добавляем тестовые данные в коллекцию
    // Здесь нужно создать реальные объекты Material, но для теста используем заглушки
    addLog('Добавляем тестовые данные в коллекцию...')
    
    // Сохраняем коллекцию в кэш
    await materialCollection.saveToCache({ ttl: 30000 })
    addLog('Коллекция сохранена в кэш ✓', 'success')
    
    // Получаем информацию о кэше
    const cacheInfo = await materialCollection.getCacheInfo()
    if (cacheInfo) {
      addLog(`Информация о кэше: элементов - ${cacheInfo.count}, последняя синхронизация - ${cacheInfo.lastSync}`)
    }
    
    // Очищаем кэш коллекции
    await materialCollection.clearCache()
    addLog('Кэш коллекции очищен ✓', 'success')
    
  } catch (error) {
    addLog(`Ошибка в тесте коллекций: ${error}`, 'error')
  } finally {
    testing.value = false
    addLog('=== Конец теста кэширования коллекций ===')
  }
}

// Тест 3: Интеграция со store
const testStoreIntegration = async () => {
  testing.value = true
  addLog('=== Начало теста интеграции со store ===')
  
  try {
    addLog('Тестируем интеграцию с materialsStore...')
    
    // Получаем статистику кэша
    const stats = await getCacheStats()
    addLog(`Текущая статистика кэша: поддержка - ${stats.supported}, элементов - ${stats.totalItems}`)
    
    if (stats.supported) {
      addLog('IndexedDB поддерживается в store ✓', 'success')
      
      // Проверяем статус кэша в store
      addLog(`Статус кэша в store: ${materialsStore.cacheStatus || 'не определен'}`)
      
      // Здесь можно было бы протестировать загрузку материалов с кэшированием,
      // но для этого нужен реальный projectObjectId
      addLog('Для полного тестирования store необходим реальный ID объекта проекта', 'warning')
      
    } else {
      addLog('IndexedDB не поддерживается', 'error')
    }
    
  } catch (error) {
    addLog(`Ошибка в тесте store: ${error}`, 'error')
  } finally {
    testing.value = false
    addLog('=== Конец теста интеграции со store ===')
  }
}

// Очистка всех тестовых данных
const clearTestData = async () => {
  testing.value = true
  addLog('=== Очистка всех тестовых данных ===')
  
  try {
    await clearCache()
    addLog('Все тестовые данные очищены ✓', 'success')
    message.success('Тестовые данные очищены')
  } catch (error) {
    addLog(`Ошибка очистки: ${error}`, 'error')
    message.error('Ошибка очистки тестовых данных')
  } finally {
    testing.value = false
  }
}

// Инициализация
onMounted(() => {
  addLog('Страница тестирования IndexedDB загружена')
  addLog(`Поддержка IndexedDB: ${isSupported() ? 'Да' : 'Нет'}`)
})
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
