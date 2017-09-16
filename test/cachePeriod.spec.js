import expect from 'expect'
import { cachePeriodAgo, getCachePeriod, getHalfCachePeriod } from '../src/cachePeriod'

process.env.NODE_ENV = 'test'

function setProcessEnv({ CACHE_PERIOD, HALF_CACHE_PERIOD,
                         REACT_APP_CACHE_PERIOD, REACT_APP_HALF_CACHE_PERIOD }) {
  process.env.CACHE_PERIOD = CACHE_PERIOD
  process.env.HALF_CACHE_PERIOD = HALF_CACHE_PERIOD
  process.env.REACT_APP_CACHE_PERIOD = REACT_APP_CACHE_PERIOD
  process.env.REACT_APP_HALF_CACHE_PERIOD = REACT_APP_HALF_CACHE_PERIOD
}


function runTests({ title, expectedCachePeriod, expectedHalfCachePeriod, env }) {
  describe(title, () => {
    it('cachePeriodAgo', () => {
      setProcessEnv(env)
      const then = 1000
      const now = then + expectedCachePeriod
      expect(cachePeriodAgo(now, getCachePeriod({ showMessages: true }))).toEqual(then)
    })
    it('cachePeriod', () => {
      setProcessEnv(env)
      expect(getCachePeriod({ showMessages: true })).toEqual(expectedCachePeriod)
    })
    it('halfCachePeriod', () => {
      setProcessEnv(env)
      expect(getHalfCachePeriod()).toEqual(expectedHalfCachePeriod)
    })
  })
}

describe('default value', () => {
  runTests({
    title: 'is ten minutes',
    expectedCachePeriod: 10 * 60 * 1000,
    expectedHalfCachePeriod: 5 * 60 * 1000,
    env: {
      CACHE_PERIOD: null,
      HALF_CACHE_PERIOD: null,
      REACT_APP_CACHE_PERIOD: null,
      REACT_APP_HALF_CACHE_PERIOD: null
    }
  })
})

describe.skip('when using react app env vars', () => {
  const eightMinutes = 8 * 60 * 1000
  const sixMinutes = 5 * 60 * 1000

  runTests({
    title: 'values match env vars',
    expectedCachePeriod: eightMinutes,
    expectedHalfCachePeriod: sixMinutes,
    env: {
      CACHE_PERIOD: null,
      HALF_CACHE_PERIOD: null,
      REACT_APP_CACHE_PERIOD: eightMinutes,
      REACT_APP_HALF_CACHE_PERIOD: sixMinutes
    }
  })
})

describe('when using vanilla env vars', () => {
  const twentyMinutes = 20 * 60 * 1000
  const elevenMinutes = 11 * 60 * 1000
  const eightMinutes = 8 * 60 * 1000
  const sixMinutes = 5 * 60 * 1000

  runTests({
    title: 'values override react app ones',
    expectedCachePeriod: twentyMinutes,
    expectedHalfCachePeriod: elevenMinutes,
    env: {
      CACHE_PERIOD: twentyMinutes,
      HALF_CACHE_PERIOD: elevenMinutes,
      REACT_APP_CACHE_PERIOD: eightMinutes,
      REACT_APP_HALF_CACHE_PERIOD: sixMinutes
    }
  })
})
