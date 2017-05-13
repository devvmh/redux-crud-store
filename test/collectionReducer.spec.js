import expect from 'expect'
import { toJS, fromJS } from 'immutable'
import { collectionReducer } from '../src/reducers.js'
import {
    FETCH, FETCH_SUCCESS, FETCH_ERROR,
} from '../src/actionTypes'

const initialState = fromJS({
    params: {},
    otherInfo: {},
    ids: [],
    fetchTime: null,
    error: null
})

describe('collectionReducer', () => {
  const params = { params: 'cool params' }

  it('FETCH', () => {
    const action = { type: FETCH,  meta: { params }}

    const newState = collectionReducer(initialState, action)

    expect(newState.get('params').toJS()).toEqual(params)
    expect(newState.get('fetchTime')).toEqual(0)
    expect(newState.get('error')).toEqual(null)
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

    expect(newState.get('params').toJS()).toEqual(params)
    expect(newState.get('ids').toJS()).toEqual([1, 2])
    expect(newState.get('otherInfo').toJS()).toEqual(otherInfo)
    expect(newState.get('error')).toEqual(null)
    expect(newState.get('fetchTime')).toEqual(fetchTime)
  })
  it('FETCH_ERROR', () => {
    const error = { error: 'oh no' }
    const action = { type: FETCH_ERROR,  payload: error, meta: { params } }

    const newState = collectionReducer(initialState, action)

    expect(newState.get('params').toJS()).toEqual(params)
    expect(newState.get('error')).toEqual(error)
  })
})
