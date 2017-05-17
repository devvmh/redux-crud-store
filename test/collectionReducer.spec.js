import expect from 'expect'
import { collectionReducer } from '../src/reducers.js'
import deepFreeze from 'deep-freeze'
import {
    FETCH, FETCH_SUCCESS, FETCH_ERROR
} from '../src/actionTypes'

const initialState = {
  params: {},
  otherInfo: {},
  ids: [],
  fetchTime: null,
  error: null
}
deepFreeze(initialState)

describe('collectionReducer', () => {
  const params = { params: 'cool params' }

  it('FETCH', () => {
    const action = { type: FETCH, meta: { params } }

    const newState = collectionReducer(initialState, action)

    expect(newState.params).toEqual(params)
    expect(newState.fetchTime).toEqual(0)
    expect(newState.error).toEqual(null)
  })
  it('FETCH_SUCCESS', () => {
    const fetchTime = Date.now() - 400 // arbitrary
    const otherInfo = { paginationInfo: 'some info' }
    const data = [{ id: 1 }, { id: 2 }]
    const envelope = Object.assign({}, otherInfo, { data })
    const action = {
      type: FETCH_SUCCESS,
      payload: envelope,
      meta: { fetchTime, params }
    }

    const newState = collectionReducer(initialState, action)

    expect(newState.params).toEqual(params)
    expect(newState.ids).toEqual([1, 2])
    expect(newState.otherInfo).toEqual(otherInfo)
    expect(newState.error).toEqual(null)
    expect(newState.fetchTime).toEqual(fetchTime)
  })
  it('FETCH_ERROR', () => {
    const error = { error: 'oh no' }
    const action = { type: FETCH_ERROR, payload: error, meta: { params } }

    const newState = collectionReducer(initialState, action)

    expect(newState.params).toEqual(params)
    expect(newState.error).toEqual(error)
  })
})
