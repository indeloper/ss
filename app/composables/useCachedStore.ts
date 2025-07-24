import type { CacheableCollection } from '~/models/collections/CacheableCollection'
import { useIndexedDB, type CacheOptions } from './useIndexedDB'

/**
 * Composable для интеграции кэширования с Pinia stores
 */
export const useCachedStore = () => {
  const { isSupported, getAllCacheInfo, clearAllCache, clearCache: clearCacheByType } = useIndexedDB()

  /**
   * Загрузить данные из кэша или с сервера с автоматическим кэшированием
   */
  const loadWithCache = async <T extends CacheableCollection<any>>(
    collection: T,
    fetchFn: () => Promise<void>,
    options: CacheOptions & {
      maxAge?: number // максимальный возраст кэша в миллисекундах
      forceRefresh?: boolean // принудительно загрузить с сервера
    } = {}
  ): Promise<'cache' | 'server' | 'error'> => {
    if (!isSupported()) {
      // Если IndexedDB не поддерживается, загружаем с сервера
      try {
        await fetchFn()
        return 'server'
      } catch (error) {
        console.error('Error loading data from server:', error)
        return 'error'
      }
    }

    try {
      // Проверяем актуальность кэша
      const isCacheValid = await collection.isCacheValid(options.maxAge)
      
      if (!options.forceRefresh && isCacheValid) {
        // Загружаем из кэша
        const loaded = await collection.loadFromCache(options)
        if (loaded) {
          console.log(`Data loaded from cache for ${collection.constructor.name}`)
          return 'cache'
        }
      }

      // Загружаем с сервера
      await fetchFn()
      
      // Сохраняем в кэш
      await collection.saveToCache(options)
      console.log(`Data loaded from server and cached for ${collection.constructor.name}`)
      return 'server'
      
    } catch (error) {
      console.error('Error in loadWithCache:', error)
      
      // В случае ошибки пытаемся загрузить из кэша
      const loaded = await collection.loadFromCache(options)
      if (loaded) {
        console.log(`Fallback to cache for ${collection.constructor.name}`)
        return 'cache'
      }
      
      return 'error'
    }
  }

  /**
   * Обновить данные с автоматическим кэшированием
   */
  const updateWithCache = async <T extends CacheableCollection<any>>(
    collection: T,
    newItems: any[],
    options: CacheOptions = {}
  ): Promise<void> => {
    await collection.updateWithCache(newItems, options)
  }

  /**
   * Добавить элемент с автоматическим кэшированием
   */
  const addWithCache = async <T extends CacheableCollection<any>>(
    collection: T,
    item: any,
    options: CacheOptions = {}
  ): Promise<void> => {
    await collection.addWithCache(item, options)
  }

  /**
   * Удалить элемент с автоматическим кэшированием
   */
  const removeWithCache = async <T extends CacheableCollection<any>>(
    collection: T,
    predicate: (item: any) => boolean,
    options: CacheOptions = {}
  ): Promise<boolean> => {
    return await collection.removeWithCache(predicate, options)
  }

  /**
   * Получить статистику кэша
   */
  const getCacheStats = async () => {
    if (!isSupported()) {
      return {
        supported: false,
        caches: []
      }
    }

    const cacheInfo = await getAllCacheInfo()
    const totalItems = cacheInfo.reduce((sum, info) => sum + info.count, 0)
    const totalSize = await estimateCacheSize()

    return {
      supported: true,
      totalItems,
      totalSize,
      caches: cacheInfo
    }
  }

  /**
   * Оценка размера кэша (приблизительно)
   */
  const estimateCacheSize = async (): Promise<string> => {
    if (!isSupported()) return '0 B'

    try {
      // Используем Storage API для оценки размера
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        const usage = estimate.usage || 0
        return formatBytes(usage)
      }
    } catch (error) {
      console.warn('Could not estimate cache size:', error)
    }

    return 'Unknown'
  }

  /**
   * Форматирование размера в байтах
   */
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Очистить кэш конкретного типа
   */
  const clearSpecificCache = async (type: string): Promise<void> => {
    await clearCacheByType(type)
  }

  /**
   * Очистить весь кэш
   */
  const clearCache = async (): Promise<void> => {
    await clearAllCache()
  }

  /**
   * Проверить поддержку IndexedDB
   */
  const checkSupport = (): boolean => {
    return isSupported()
  }

  return {
    loadWithCache,
    updateWithCache,
    addWithCache,
    removeWithCache,
    getCacheStats,
    clearCache,
    clearSpecificCache,
    checkSupport,
    isSupported: checkSupport
  }
}
