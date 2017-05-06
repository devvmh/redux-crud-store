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

describe('byIdReducer', () => {
  describe('DELETE actions', () => {
    const initialState = fromJS({
      0: sampleRecord,
      1: sampleRecord
    })

    it('does nothing for DELETE', () => {
      const action = { type: DELETE, meta: { id: 1 } }
      expect(byIdReducer(initialState, action)).toEqual(initialState)
    })
    it('does nothing for DELETE_ERROR', () => {
      const action = { type: DELETE_ERROR, meta: { id: 1 } }
      expect(byIdReducer(initialState, action)).toEqual(initialState)
    })
    it('removes record on DELETE_SUCCESS', () => {
      const action = { type: DELETE_SUCCESS, meta: { id: 1 } }
      const newState = byIdReducer(initialState, action)
      expect(newState.get('0')).toEqual(sampleRecord)
      expect(newState.get('1')).toEqual(undefined)
      expect(Object.keys(newState.toJS()).length).toEqual(1)
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
