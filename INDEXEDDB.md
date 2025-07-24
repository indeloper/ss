# IndexedDB Integration Documentation

## Обзор

В проект добавлена полная поддержка IndexedDB для кэширования данных и работы в оффлайн режиме. Интеграция включает в себя:

- **Библиотека Dexie** - современная обёртка для IndexedDB
- **CacheableCollection** - расширение BaseCollection с поддержкой кэширования
- **useIndexedDB** - основной composable для работы с IndexedDB
- **useCachedStore** - composable для интеграции с Pinia stores
- **CacheManager** - UI компонент для управления кэшем

## Архитектура

### 1. useIndexedDB Composable

Основной composable для работы с IndexedDB. Предоставляет низкоуровневые методы для работы с кэшем.

```typescript
import { useIndexedDB } from '~/composables/useIndexedDB'

const { 
  setCache,           // Сохранить данные в кэш
  getCache,           // Получить данные из кэша
  clearCache,         // Очистить конкретный тип кэша
  clearAllCache,      // Очистить весь кэш
  getCacheInfo,       // Получить информацию о кэше
  getAllCacheInfo,    // Получить информацию о всех кэшах
  isCacheValid,       // Проверить актуальность кэша
  isSupported         // Проверить поддержку IndexedDB
} = useIndexedDB()
```

### 2. CacheableCollection

Расширение BaseCollection с автоматическим кэшированием:

```typescript
import { CacheableCollection } from '~/models/collections/CacheableCollection'

class MyCollection extends CacheableCollection<MyModel> {
  protected cacheKey = 'myModels'
  
  constructor() {
    super()
    // Настройки кэширования
    this.setCacheOptions({
      ttl: 60 * 60 * 1000, // 1 час
      version: 1
    })
  }
}
```

### 3. useCachedStore Composable

Высокоуровневый composable для интеграции с Pinia stores:

```typescript
import { useCachedStore } from '~/composables/useCachedStore'

const { 
  loadWithCache,      // Загрузить с кэшированием
  updateWithCache,    // Обновить с кэшированием
  addWithCache,       // Добавить с кэшированием
  removeWithCache,    // Удалить с кэшированием
  getCacheStats,      // Получить статистику кэша
  clearCache,         // Очистить весь кэш
  clearSpecificCache  // Очистить конкретный тип
} = useCachedStore()
```

## Использование

### Базовое кэширование

```typescript
// Сохранение данных в кэш
await setCache('materials', materials, {
  ttl: 30 * 60 * 1000, // 30 минут
  version: 1
})

// Загрузка данных из кэша
const cachedMaterials = await getCache('materials')
if (cachedMaterials) {
  // Используем кэшированные данные
  console.log('Loaded from cache:', cachedMaterials)
}
```

### Работа с коллекциями

```typescript
// Создание коллекции с кэшированием
const materials = new MaterialCollection()

// Загрузка из кэша
const loaded = await materials.loadFromCache()
if (!loaded) {
  // Загружаем с сервера, если кэш пуст
  await loadFromServer()
  // Сохраняем в кэш
  await materials.saveToCache()
}

// Добавление элемента с автоматическим обновлением кэша
await materials.addWithCache(newMaterial)

// Удаление элемента с автоматическим обновлением кэша
await materials.removeByIdWithCache(materialId)
```

### Интеграция со Store

```typescript
// В Pinia store
export const useMyStore = defineStore('myStore', () => {
  const collection = ref(new MyCollection())
  const { loadWithCache } = useCachedStore()
  
  const loadData = async (forceRefresh = false) => {
    const status = await loadWithCache(
      collection.value,
      async () => {
        // Функция загрузки с сервера
        const data = await fetchFromAPI()
        collection.value = new MyCollection(data)
      },
      {
        maxAge: 30 * 60 * 1000, // 30 минут
        forceRefresh
      }
    )
    
    console.log('Load status:', status) // 'cache' | 'server' | 'error'
  }
  
  return { collection, loadData }
})
```

## Настройки кэширования

### Опции кэширования (CacheOptions)

```typescript
interface CacheOptions {
  ttl?: number        // Время жизни в миллисекундах
  version?: number    // Версия данных
  forceRefresh?: boolean // Принудительное обновление
}
```

### Рекомендуемые TTL значения

- **Материалы**: 30 минут (часто изменяются)
- **Стандарты материалов**: 1 час (относительно стабильны)
- **Бренды/Свойства**: 2 часа (редко изменяются)
- **Подрядчики**: 4 часа (очень редко изменяются)
- **Справочники**: 8 часов (практически не изменяются)

## Обновленные коллекции

Следующие коллекции теперь поддерживают кэширование:

- ✅ **MaterialCollection** (cacheKey: 'materials', TTL: 30 мин)
- ✅ **MaterialStandardCollection** (cacheKey: 'materialStandards', TTL: 1 час)
- ✅ **MaterialBrandCollection** (cacheKey: 'materialBrands', TTL: 2 часа)
- ✅ **MaterialPropertyCollection** (cacheKey: 'materialProperties', TTL: 2 часа)
- ✅ **ContractorCollection** (cacheKey: 'contractors', TTL: 4 часа)

### Добавление кэширования в новые коллекции

```typescript
import { CacheableCollection } from './CacheableCollection'

export class MyNewCollection extends CacheableCollection<MyModel> {
  protected cacheKey = 'myNewModels' // Уникальный ключ
  
  constructor(data: MyModel[] = []) {
    super(data)
    
    // Настройки кэширования по умолчанию
    this.setCacheOptions({
      ttl: 60 * 60 * 1000, // 1 час
      version: 1
    })
  }
}
```

## UI Компоненты

### CacheManager

Компонент для управления кэшем IndexedDB:

```vue
<template>
  <CacheManager />
</template>

<script setup>
import CacheManager from '~/components/cache/CacheManager.vue'
</script>
```

Функциональность:
- Просмотр статистики кэша
- Очистка всего кэша или конкретных типов
- Мониторинг размера и актуальности данных

## Тестирование

Создана страница `/cache-test` для тестирования функциональности IndexedDB:

- Тест базового кэширования
- Тест кэширования коллекций  
- Тест интеграции со store
- Управление кэшем через UI

## Обработка ошибок

### Отсутствие поддержки IndexedDB

```typescript
const { isSupported } = useIndexedDB()

if (!isSupported()) {
  console.warn('IndexedDB not supported, falling back to memory storage')
  // Fallback логика
}
```

### Ошибки кэширования

```typescript
try {
  await setCache('materials', data)
} catch (error) {
  console.error('Cache error:', error)
  // Приложение продолжает работать без кэширования
}
```

### Автоматический fallback

При ошибках кэширования система автоматически переключается на загрузку с сервера:

```typescript
const status = await loadWithCache(collection, fetchFn)
// status может быть 'cache', 'server' или 'error'
```

## Производительность

### Преимущества

- **Быстрая загрузка**: данные из кэша загружаются мгновенно
- **Оффлайн работа**: приложение работает без интернета
- **Снижение нагрузки**: меньше запросов к серверу
- **Улучшенный UX**: отсутствие задержек при повторных посещениях

### Мониторинг

```typescript
const { getCacheStats } = useCachedStore()

const stats = await getCacheStats()
console.log('Cache stats:', {
  totalItems: stats.totalItems,
  totalSize: stats.totalSize,
  caches: stats.caches
})
```

## Миграции

При изменении структуры данных увеличивайте версию кэша:

```typescript
// Старая версия
this.setCacheOptions({ version: 1 })

// Новая версия (автоматически очистит старый кэш)
this.setCacheOptions({ version: 2 })
```

## Лучшие практики

1. **Используйте подходящие TTL**: не делайте кэш слишком долгим или коротким
2. **Версионирование**: увеличивайте версию при изменении структуры данных
3. **Обработка ошибок**: всегда предусматривайте fallback на сервер
4. **Мониторинг**: следите за размером и актуальностью кэша
5. **Очистка**: предоставляйте пользователям возможность очистить кэш

## Troubleshooting

### Кэш не сохраняется
- Проверьте поддержку IndexedDB: `isSupported()`
- Убедитесь, что объекты имеют методы `getId()` и `getUuid()`
- Проверьте консоль на ошибки

### Данные не загружаются из кэша
- Проверьте срок действия (TTL)
- Убедитесь, что версия кэша совпадает
- Проверьте правильность cacheKey

### Большой размер кэша
- Уменьшите TTL для часто изменяющихся данных
- Регулярно очищайте неиспользуемые кэши
- Используйте селективное кэширование
