import expect, { createSpy } from 'expect'
import { fromJS } from 'immutable'
import { collectionsReducer } from '../src/reducers.js'
import {
  FETCH, FETCH_SUCCESS, FETCH_ERROR,
  CREATE_SUCCESS, DELETE_SUCCESS, GARBAGE_COLLECT
} from '../src/actionTypes'

const initialCollection = fromJS({
  params: { page: 0 },
  otherInfo: {},
  ids: [],
  fetchTime: Date.now() - 400, // arbitrary time
  error: null
})

const initialCollection2 = initialCollection.set('params', fromJS({ page: 1 }))

const initialState = fromJS([
  initialCollection.toJS(),
  initialCollection2.toJS()
])

const newCollection = fromJS({ mock: true, params: { page: 0 }, ids: [1] })
const updatedCollection = fromJS({ mock: true, params: { page: 0 }, ids: [2] })

describe('collectionsReducer', () => {
  it('does nothing if action.meta.params is undefined', () => {
    const action = { type: FETCH, meta: {} }
    const newState = collectionsReducer(initialState, action)
    expect(newState.toJS()).toEqual(initialState.toJS())
  })

  describe('fetch_* tests', () => {
    const fetchTestsArray = [
      { actionType: FETCH, testName: 'FETCH'},
      { actionType: FETCH_SUCCESS, testName: 'FETCH_SUCCESS'},
      { actionType: FETCH_ERROR, testName: 'FETCH_ERROR'}
    ]
    describe('collection is already defined', () => {
      const params = { page: 0 }
      const collectionReducerStub = createSpy().andReturn(updatedCollection)

      fetchTestsArray.forEach(({ actionType, testName }) => {
        it(testName, () => {
          const action = { type: actionType,  meta: { params }}
          const newState = collectionsReducer(initialState, action, { collectionReducer: collectionReducerStub })

          // behaviour check
          expect(collectionReducerStub).toHaveBeenCalledWith(initialCollection, action)
          expect(newState.get(0).toJS()).toEqual(updatedCollection.toJS())

          // sanity check
          expect(newState.get(1).toJS()).toEqual(initialCollection2.toJS())
          expect(newState.get(2)).toEqual(undefined)
        })
      })
    })
    describe('collection is not defined yet', () => {
      const params = { page: 2 }
      const collectionReducerStub = createSpy().andReturn(newCollection)

      fetchTestsArray.forEach(({ actionType, testName }) => {
        it(testName, () => {
          const action = { type: actionType,  meta: { params }}
          const newState = collectionsReducer(initialState, action, collectionReducerStub)

          // behaviour check
          expect(collectionReducerStub).toHaveBeenCalledWith(undefined, action)
          expect(newState.get(2).toJS()).toEqual(newCollection.toJS())

          // sanity check
          expect(newState.get(0).toJS()).toEqual(initialCollection.toJS())
          expect(newState.get(1).toJS()).toEqual(initialCollection2.toJS())
        })
      })
    })
  })
  describe('create/delete success', () => {
    // TODO this seems like incorrect behaviour
    it('CREATE_SUCCESS sets fetchTime to null', () => {
      const action = { type: CREATE_SUCCESS }
      const newState = collectionsReducer(initialState, action)
      expect(newState.toJS()[0].fetchTime).toEqual(null)
      expect(newState.toJS()[1].fetchTime).toEqual(null)
    })
    it('DELETE_SUCCESS sets fetchTime to null', () => {
      const action = { type: DELETE_SUCCESS }
      const newState = collectionsReducer(initialState, action)
      expect(newState.toJS()[0].fetchTime).toEqual(null)
      expect(newState.toJS()[1].fetchTime).toEqual(null)
    })
  })

  describe('garbage collect', () => {
    it('filters out records older than ten minutes', () => {
      const tenMinutes = 10 * 60 * 1000
      const now = 12345678
      const oldCollection = initialCollection.set('fetchTime', now - 400 - tenMinutes)
      const initialStatePlusOldCollection = initialState.push(oldCollection)
      const action = { type: GARBAGE_COLLECT, meta: { now } }
      const newState = collectionsReducer(initialStatePlusOldCollection, action)

      expect(initialStatePlusOldCollection.toJS().length).toEqual(3)
      expect(newState.toJS().length).toEqual(2)
      expect(newState.get(0).toJS()).toEqual(initialStatePlusOldCollection.get(0).toJS())
      expect(newState.get(1).toJS()).toEqual(initialStatePlusOldCollection.get(1).toJS())
    })
  })
})
