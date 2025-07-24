import { BaseCollection } from './BaseCollection'
import { useIndexedDB, type CacheOptions } from '~/composables/useIndexedDB'

/**
 * Расширение BaseCollection с поддержкой кэширования в IndexedDB
 */
export abstract class CacheableCollection<T extends { getId(): number; getUuid(): string }> extends BaseCollection<T> {
  protected abstract cacheKey: string
  protected cacheOptions: CacheOptions = {}

  constructor(items: T[] | BaseCollection<T> = []) {
    super(items)
  }

  async saveToCache(options: CacheOptions = {}): Promise<void> {
    const { setCache } = useIndexedDB()
    const mergedOptions = { ...this.cacheOptions, ...options }
    await setCache(this.cacheKey, this.getAll(), mergedOptions)
  }

  async loadFromCache(options: CacheOptions = {}): Promise<boolean> {
    const { getCache } = useIndexedDB()
    const mergedOptions = { ...this.cacheOptions, ...options }
    
    const cachedItems = await getCache<T>(this.cacheKey, mergedOptions)
    
    if (cachedItems) {
      this.items = cachedItems
      return true
    }
    
    return false
  }

  async syncWithCache(options: CacheOptions = {}): Promise<'loaded' | 'saved' | 'none'> {
    const loaded = await this.loadFromCache(options)
    if (loaded) {
      return 'loaded'
    }

    if (!this.isEmpty()) {
      await this.saveToCache(options)
      return 'saved'
    }

    return 'none'
  }

  async clearCache(): Promise<void> {
    const { clearCache } = useIndexedDB()
    await clearCache(this.cacheKey)
  }

  async isCacheValid(maxAge?: number): Promise<boolean> {
    const { isCacheValid } = useIndexedDB()
    return await isCacheValid(this.cacheKey, maxAge)
  }

  async getCacheInfo() {
    const { getCacheInfo } = useIndexedDB()
    return await getCacheInfo(this.cacheKey)
  }

  async updateWithCache(newItems: T[], options: CacheOptions = {}): Promise<void> {
    this.items = newItems
    await this.saveToCache(options)
  }

  async addWithCache(item: T, options: CacheOptions = {}): Promise<void> {
    this.add(item)
    await this.saveToCache(options)
  }

  async removeWithCache(predicate: (item: T) => boolean, options: CacheOptions = {}): Promise<boolean> {
    const initialLength = this.items.length
    this.items = this.items.filter(item => !predicate(item))
    
    if (this.items.length !== initialLength) {
      await this.saveToCache(options)
      return true
    }
    
    return false
  }

  async removeByIdWithCache(id: number, options: CacheOptions = {}): Promise<boolean> {
    return await this.removeWithCache(item => item.getId() === id, options)
  }

  async removeByUuidWithCache(uuid: string, options: CacheOptions = {}): Promise<boolean> {
    return await this.removeWithCache(item => item.getUuid() === uuid, options)
  }

  setCacheOptions(options: CacheOptions): void {
    this.cacheOptions = options
  }

  getCacheOptions(): CacheOptions {
    return { ...this.cacheOptions }
  }
}
