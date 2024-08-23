export function getItemFromCache(key: string, useCache = true) {
  let cached = null
  let cachedTimestamp = null
  const expirationTime = 3600000

  if (useCache) {
    const cachedData = localStorage.getItem(key)

    if (cachedData) {
      const parsedData = JSON.parse(cachedData)
      cachedTimestamp = parsedData.timestamp
      cached = parsedData.data
    }
  }

  // Check if there is cache and it is less than expirationTime old
  return cached && cachedTimestamp && Date.now() - cachedTimestamp < expirationTime ? cached : undefined
}

export function setItemToCache(key: string, data: any) {
  const cacheData = {
    data: data,
    timestamp: Date.now(), // Store current timestamp
  }

  localStorage.setItem(key, JSON.stringify(cacheData))
}
