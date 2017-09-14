const TEN_MINUTES = 10 * 60 * 1000

// private
function getCachePeriod() {
  return TEN_MINUTES
}

// private
function getHalfCachePeriod() {
  return TEN_MINUTES / 2
}

function cachePeriodAgo(now) {
  const cachePeriod = TEN_MINUTES
  return now - cachePeriod
}

const cachePeriod = getCachePeriod()
const halfCachePeriod = getHalfCachePeriod()

export { cachePeriodAgo, cachePeriod, halfCachePeriod }
