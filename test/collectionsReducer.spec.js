import expect, { createSpy } from 'expect'
import { collectionsReducer } from '../src/reducers.js'
import deepFreeze from 'deep-freeze'
import {
  FETCH, FETCH_SUCCESS, FETCH_ERROR,
  CREATE_SUCCESS, DELETE_SUCCESS, GARBAGE_COLLECT
} from '../src/actionTypes'

const initialCollection = {
  params: { page: 0 },
  otherInfo: {},
  ids: [],
  fetchTime: Date.now() - 400, // arbitrary time
  error: null
}

const initialCollection2 = Object.assign({}, initialCollection, { params: { page: 1 } })

const initialState = [
  initialCollection,
  initialCollection2
]
deepFreeze(initialState)

const newCollection = { mock: true, params: { page: 0 }, ids: [1] }
const updatedCollection = { mock: true, params: { page: 0 }, ids: [2] }

describe('collectionsReducer', () => {
  it('does nothing if action.meta.params is undefined', () => {
    const action = { type: FETCH, meta: {} }
    const newState = collectionsReducer(initialState, action)
    expect(newState).toEqual(initialState)
  })

  describe('fetch_* tests', () => {
    const fetchTestsArray = [
      { actionType: FETCH, testName: 'FETCH' },
      { actionType: FETCH_SUCCESS, testName: 'FETCH_SUCCESS' },
      { actionType: FETCH_ERROR, testName: 'FETCH_ERROR' }
    ]
    describe('collection is already defined', () => {
      const params = { page: 0 }
      const collectionReducer = createSpy().andReturn(updatedCollection)

      fetchTestsArray.forEach(({ actionType, testName }) => {
        it(testName, () => {
          const action = { type: actionType, meta: { params } }
          const newState = collectionsReducer(initialState, action, { collectionReducer })

          // behaviour check
          expect(collectionReducer).toHaveBeenCalledWith(initialCollection, action)
          expect(newState[0]).toEqual(updatedCollection)

          // sanity check
          expect(newState[1]).toEqual(initialCollection2)
          expect(newState[2]).toEqual(undefined)
        })
      })
    })
    describe('collection is not defined yet', () => {
      const params = { page: 2 }
      const collectionReducer = createSpy().andReturn(newCollection)

      fetchTestsArray.forEach(({ actionType, testName }) => {
        it(testName, () => {
          const action = { type: actionType, meta: { params } }
          const newState = collectionsReducer(initialState, action, { collectionReducer })

          // behaviour check
          expect(collectionReducer).toHaveBeenCalledWith(undefined, action)
          expect(newState[2]).toEqual(newCollection)

          // sanity check
          expect(newState[0]).toEqual(initialCollection)
          expect(newState[1]).toEqual(initialCollection2)
        })
      })
    })
  })
  describe('create/delete success', () => {
    // TODO this seems like incorrect behaviour
    it('CREATE_SUCCESS sets fetchTime to null', () => {
      const action = { type: CREATE_SUCCESS }
      const newState = collectionsReducer(initialState, action)
      expect(newState[0].fetchTime).toEqual(null)
      expect(newState[1].fetchTime).toEqual(null)
    })
    it('DELETE_SUCCESS sets fetchTime to null', () => {
      const action = { type: DELETE_SUCCESS }
      const newState = collectionsReducer(initialState, action)
      expect(newState[0].fetchTime).toEqual(null)
      expect(newState[1].fetchTime).toEqual(null)
    })
  })

  describe('garbage collect', () => {
    it('filters out records older than ten minutes', () => {
      const elevenMinutes = 11 * 60 * 1000
      const now = 12345678
      const oldCollection = Object.assign({}, initialCollection, { fetchTime: now - elevenMinutes })
      const initialStatePlusOldCollection = initialState.concat([oldCollection])
      deepFreeze(initialStatePlusOldCollection)
      const action = { type: GARBAGE_COLLECT, meta: { now } }
      const newState = collectionsReducer(initialStatePlusOldCollection, action)

      expect(initialStatePlusOldCollection.length).toEqual(3)
      expect(newState.length).toEqual(2)
      expect(newState[0]).toEqual(initialStatePlusOldCollection[0])
      expect(newState[1]).toEqual(initialStatePlusOldCollection[1])
    })
  })
})
