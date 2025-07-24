import Dexie from 'dexie'
import type { CacheEntry, CacheTimestamp } from '~/types/api'

export interface StoredItem {
  id: number
  uuid: string
  data: any
  lastUpdated: Date
  version: number
}

export interface CacheMetadata {
  key: string
  lastSync: Date
  version: number
  expiresAt?: Date
}

class AppCache extends Dexie {
  cacheData!: Dexie.Table<CacheEntry>
  
  cacheTimestamps!: Dexie.Table<CacheTimestamp>

  constructor() {
    super('AppCache')
    
    this.version(1).stores({
      cacheData: '++key, data',
      cacheTimestamps: '++key, lastSync, ttl'
    })
  }
}

const db = new AppCache()

export interface CacheOptions {
  ttl?: number // время жизни в миллисекундах
  version?: number
  forceRefresh?: boolean
}

export const useIndexedDB = () => {
  
  const isSupported = () => {
    return typeof window !== 'undefined' && 'indexedDB' in window
  }

  const setCache = async <T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> => {
    if (!isSupported()) return

    try {
      const now = new Date()
      const version = options.version || 1

      const serializedData = JSON.parse(JSON.stringify(data))

      await db.cacheData.put({
        key,
        data: serializedData
      })

      await db.cacheTimestamps.put({
        key,
        lastSync: now,
        ttl: options.ttl || 0
      })

      console.log(`Cached data for key ${key}`)
    } catch (error) {
      console.error(`Error caching data for ${key}:`, error)
    }
  }

  const getCache = async <T>(
    key: string,
    options: CacheOptions = {}
  ): Promise<T | null> => {
    if (!isSupported()) return null

    try {
      const timestamp = await db.cacheTimestamps.get(key)
      if (!timestamp) return null

      if (timestamp.ttl && new Date().getTime() - timestamp.lastSync.getTime() > timestamp.ttl) {
        await clearCache(key)
        return null
      }

      if (options.forceRefresh) {
        await clearCache(key)
        return null
      }

      const cacheEntry = await db.cacheData.get(key)
      
      if (!cacheEntry) return null

      console.log(`Retrieved data for key ${key} from cache`)
      return cacheEntry.data as T
    } catch (error) {
      console.error(`Error retrieving cache for ${key}:`, error)
      return null
    }
  }

  const clearCache = async (key: string): Promise<void> => {
    if (!isSupported()) return

    try {
      await db.cacheData.delete(key)
      await db.cacheTimestamps.delete(key)
      console.log(`Cleared cache for ${key}`)
    } catch (error) {
      console.error(`Error clearing cache for ${key}:`, error)
    }
  }

  // Очистка всего кэша
  const clearAllCache = async (): Promise<void> => {
    if (!isSupported()) return

    try {
      await db.cacheData.clear()
      await db.cacheTimestamps.clear()
      console.log('Cleared all cache')
    } catch (error) {
      console.error('Error clearing all cache:', error)
    }
  }

  const getCacheInfo = async (key: string) => {
    if (!isSupported()) return null

    try {
      const timestamp = await db.cacheTimestamps.get(key)
      const cacheEntry = await db.cacheData.get(key)
      
      return {
        key,
        lastSync: timestamp?.lastSync,
        ttl: timestamp?.ttl,
        isExpired: timestamp?.ttl ? new Date().getTime() - timestamp.lastSync.getTime() > timestamp.ttl : false,
        data: cacheEntry?.data
      }
    } catch (error) {
      console.error(`Error getting cache info for ${key}:`, error)
      return null
    }
  }

  const getAllCacheInfo = async () => {
    const keys = await db.cacheTimestamps.keys()
    const infos = await Promise.all(
      keys.map(key => getCacheInfo(key))
    )

    return infos.filter(info => info !== null)
  }

  const isCacheValid = async (key: string, maxAge?: number): Promise<boolean> => {
    const info = await getCacheInfo(key)
    if (!info || !info.lastSync) return false

    if (info.isExpired) return false

    if (maxAge) {
      const age = new Date().getTime() - info.lastSync.getTime()
      return age <= maxAge
    }

    return true
  }

  return {
    isSupported,
    setCache,
    getCache,
    clearCache,
    clearAllCache,
    getCacheInfo,
    getAllCacheInfo,
    isCacheValid,
    db
  }
}
