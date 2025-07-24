export interface ApiOptions {
  forceRefresh?: boolean
}

export interface CacheEntry {
  key: string
  data: any
}

export interface CacheTimestamp {
  key: string
  lastSync: Date
  ttl: number
}
