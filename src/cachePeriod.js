const TEN_MINUTES = 10 * 60 * 1000

// private
function getCachePeriod({ showMessages = true }) {
  let value = process.env.CACHE_PERIOD
    || process.env.REACT_APP_CACHE_PERIOD
    || TEN_MINUTES
  value = Math.round(value)
  if (isNaN(value)) {
    value = TEN_MINUTES
    if (showMessages) {
      devMessage("getCachePeriod got NaN! Falling back to ten minute cache period")
    }
  }
  if (value < 1000) {
    value = TEN_MINUTES
    if (showMessages) {
      devMessage("getCachePeriod got a value under one second! Falling back to ten minute cache period")
    }
  }
  return value
}

// private
function getHalfCachePeriod() {
  let value = process.env.HALF_CACHE_PERIOD
    || process.env.REACT_APP_HALF_CACHE_PERIOD
    || getCachePeriod() / 2
  value = Math.round(value)
  if (isNaN(value)) {
    value = Math.round(getCachePeriod({ showMessages: false }) / 2)
    devMessage(`getHalfCachePeriod got NaN! Falling back to half of cachePeriod: ${value}`)
  }
  if (value < 500) {
    value = Math.round(getCachePeriod({ showMessages: false }) / 2)
    devMessage(`getHalfCachePeriod got a value under 500ms! Falling back to half of cache period: ${value}`)
  }
  return value
}

const cachePeriod = getCachePeriod()
const halfCachePeriod = getHalfCachePeriod()

function cachePeriodAgo(now, customCachePeriod = undefined) {
  const actualCachePeriod = customCachePeriod || cachePeriod
  return now - actualCachePeriod
}

export { cachePeriodAgo, cachePeriod, halfCachePeriod }
