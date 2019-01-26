class Cache {
  constructor(cacheItem, cacheTime, expireTime) {
    this.cacheItem = cacheItem
    this.cacheTime = cacheTime
    this.expireTime = expireTime
  }
}

export { Cache }