export type CacheFallback<T> = () => T

export interface ICache {
  get(key: string): Promise<any>
  get<T>(key: string): Promise<T>
  get(key: string, defaultValue: any): Promise<any>
  get<T>(key: string, defaultValue: T): Promise<T>

  set(key: string, value: any): Promise<boolean>
  set<T>(key: string, value: T): Promise<boolean>
  set(key: string, value: any, ttl?: number): Promise<boolean>
  set<T>(key: string, value: T, ttl?: number): Promise<boolean>

  has(key: string): Promise<boolean>

  clear(key: string): Promise<boolean>

  getTag(tag: string, key: string): Promise<any>
  getTag<T>(tag: string, key: string): Promise<T>
  getTag(tag: string, key: string, defaultValue: any): Promise<any>
  getTag<T>(tag: string, key: string, defaultValue: T): Promise<any>

  setTag(tag: string, key: string, value: any): Promise<boolean>
  setTag(tag: Array<string>, key: string, value: any): Promise<boolean>
  setTag(tag: string, key: string, value: any, ttl: number): Promise<boolean>
  setTag(tag: Array<string>, key: string, value: any, ttl: number): Promise<boolean>

  hasTag(tag: string): Promise<boolean>
  hasTag(tag: string, key: string): Promise<boolean>

  clearTag(tag: string): Promise<boolean>

  cache(key: string, ttl: number, fallback: CacheFallback<Promise<any>>): Promise<any>
  cache<T>(key: string, ttl: number, fallback: CacheFallback<Promise<T>>): Promise<T>

  cacheByTag<T>(tag: string, key: string, ttl: number, fallback: CacheFallback<Promise<T>>): Promise<T>
  cacheByTag<T>(tag: Array<string>, key: string, ttl: number, fallback: CacheFallback<Promise<T>>): Promise<T>
  cacheByTag(tag: string, key: string, ttl: number, fallback: CacheFallback<Promise<any>>): Promise<any>
  cacheByTag(tag: Array<string>, key: string, ttl: number, fallback: CacheFallback<Promise<any>>): Promise<any>
}
