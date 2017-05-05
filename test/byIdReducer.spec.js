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
