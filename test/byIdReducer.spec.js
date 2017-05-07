import expect from 'expect'
import { toJS, fromJS } from 'immutable'
import { byIdReducer } from '../src/reducers.js'
import {
    FETCH, FETCH_SUCCESS, FETCH_ERROR,
    FETCH_ONE, FETCH_ONE_SUCCESS, FETCH_ONE_ERROR,
    CREATE, CREATE_SUCCESS, CREATE_ERROR,
    UPDATE, UPDATE_SUCCESS, UPDATE_ERROR,
    DELETE, DELETE_SUCCESS, DELETE_ERROR,
    CLEAR_ACTION_STATUS, API_CALL, GARBAGE_COLLECT,
    CLEAR_MODEL_DATA
} from '../src/actionTypes'

const sampleRecord = fromJS({
  fetchTime: Date.now(),
  record: {},
  error: null
})

const sampleError = fromJS({
  fetchTime: Date.now(),
  record: null,
  error: {}
})

const changedRecord = {
  id: 1,
  changed: true
}

const newRecord = {
  id: 2,
  created: true
}

describe('byIdReducer', () => {
  describe('POST actions', () => {
    const initialState = fromJS({
      0: sampleRecord,
      1: sampleRecord
    })

    it('does nothing for CREATE', () => {
      const action = { type: CREATE }
      expect(byIdReducer(initialState, action)).toEqual(initialState)
    })
    it('stores the record on CREATE_SUCCESS', () => {
      const arbitraryFetchTime = Date.now() + 400
      const action = {
        type: CREATE_SUCCESS,
        payload: newRecord,
        meta: { fetchTime: arbitraryFetchTime }
      }
      const newState = byIdReducer(initialState, action)
      expect(newState.getIn(['2', 'record', 'created'])).toEqual(true)
      expect(newState.getIn(['2', 'fetchTime'])).toEqual(arbitraryFetchTime)
    })
    it('does nothing for CREATE_ERROR', () => {
      const action = { type: CREATE_ERROR }
      expect(byIdReducer(initialState, action)).toEqual(initialState)
    })
    it('resets fetchTime on UPDATE', () => {
      const action = { type: UPDATE, meta: { id: 1 } }
      const newState = byIdReducer(initialState, action)
      expect(newState.get('1').get('fetchTime')).toEqual(0)
    })
    it('updates record on UPDATE_SUCCESS', () => {
      const action = {
        type: UPDATE_SUCCESS, meta: { id: 1 },
        payload: changedRecord
      }
      const newState = byIdReducer(initialState, action)
      expect(newState.getIn(['1', 'record', 'changed'])).toEqual(true)
    })
    it('does nothing for UPDATE_ERROR', () => {
      const action = { type: UPDATE_ERROR }
      expect(byIdReducer(initialState, action)).toEqual(initialState)
    })
    it('does nothing for DELETE', () => {
      const action = { type: DELETE }
      expect(byIdReducer(initialState, action)).toEqual(initialState)
    })
    it('removes record on DELETE_SUCCESS', () => {
      const action = { type: DELETE_SUCCESS, meta: { id: 1 } }
      const newState = byIdReducer(initialState, action)
      expect(newState.get('0')).toEqual(sampleRecord)
      expect(newState.get('1')).toEqual(undefined)
      expect(Object.keys(newState.toJS()).length).toEqual(1)
    })
    it('does nothing for DELETE_ERROR', () => {
      const action = { type: DELETE_ERROR }
      expect(byIdReducer(initialState, action)).toEqual(initialState)
    })
  })

  describe('GARBAGE_COLLECT', () => {
    const initialState = fromJS({
      0: sampleRecord.set('fetchTime', Date.now() - 11 * 60 * 1000), // more than ten minutes ago
      1: sampleRecord
    })

    it('clears records older than 10 minutes', () => {
      const action = { type: GARBAGE_COLLECT, meta: { now: Date.now() } }
      const newState = byIdReducer(initialState, action)
      expect(Object.keys(newState.toJS()).length).toEqual(1)
      expect(newState.get('0')).toEqual(undefined)
      expect(newState.get('1')).toEqual(sampleRecord)
    })
  })
})
