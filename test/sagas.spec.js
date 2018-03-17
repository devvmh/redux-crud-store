/* @flow */

import 'babel-polyfill'
import expect from 'expect'
declare var describe
declare var it

import { call } from 'redux-saga/effects'
import { apiGeneric } from '../src/sagas'

import {
  FETCH_SUCCESS, FETCH_ERROR
} from '../src/actionTypes'
import {
  fetchCollection, fetchRecord, createRecord, updateRecord, deleteRecord
} from '../src/actionCreators'

import type { CrudAction } from '../src/actionTypes'

type Widget = {
  id: number,
  name: string,
}

const modelName = 'widgets'

const widgets = [
  { id: 1, name: 'one' },
  { id: 2, name: 'two' },
  { id: 3, name: 'three' }
]

/* action creators */
function fetchWidgets(page): CrudAction<Widget[]> {
  return fetchCollection(modelName, '/widgets', { page })
}
function fetchWidget(id): CrudAction<Widget> {
  return fetchRecord(modelName, id, `/widgets/${id}`)
}
function createWidget(w): CrudAction<Widget> {
  return createRecord(modelName, '/widgets', w)
}
function updateWidget(id, w): CrudAction<Widget> {
  return updateRecord(modelName, id, `/widgets/${id}`, w)
}
function deleteWidget(id): CrudAction<void> {
  return deleteRecord(modelName, id, `/widgets/${id}`)
}

const apiClient = {
  get: () => {},
  post: () => {},
  put: () => {},
  del: () => {}
}

// Extracts action from a redux-saga `put` effect. The internal structure of the
// `put` effect changed in redux-saga v0.10. This function handles both the
// v0.10 and v0.9 formats.
function getAction(effect) {
  return effect.PUT.action ? effect.PUT.action : effect.PUT
}

describe('apiGeneric', () => {
  it('invokes API client methods', () => {
    const gen = apiGeneric(apiClient)(fetchWidgets(1))
    const apiCall = gen.next().value
    expect(apiCall).toEqual(
      call([apiClient, apiClient.get], '/widgets', {
        params: { page: 1 },
        data: undefined,
        fetchConfig: undefined
      })
    )
  })
  it('dispatches success event', () => {
    const gen = apiGeneric(apiClient)(fetchWidgets(1))
    const apiCall = gen.next().value
    const putSuccess = gen.next(widgets).value
    if (!putSuccess) { throw new Error('undefined yield value') }  // Flow wants this check
    const action = getAction(putSuccess)
    expect(action).toExist()
    expect(action.type).toEqual(FETCH_SUCCESS)
    expect(action.payload).toEqual(widgets)
  })
  it('dispatches error event', () => {
    const error = new Error('fetch failed')
    const gen = apiGeneric(apiClient)(fetchWidgets(1))
    const apiCall = gen.next().value
    const putError = gen.throw(error).value
    if (!putError) { throw new Error('undefined yield value') }  // Flow wants this check
    const action = getAction(putError)
    expect(action).toExist()
    expect(action.type).toEqual(FETCH_ERROR)
    expect(action.payload).toBe(error)
  })
  it('attaches `fetchTime` property to dispatched action meta', () => {
    const gen = apiGeneric(apiClient)(fetchWidgets(1))
    const apiCall = gen.next().value
    const putSuccess = gen.next(widgets).value
    if (!putSuccess) { throw new Error('undefined yield value') }  // Flow wants this check
    const action = getAction(putSuccess)
    expect(action.meta.fetchTime).toBeA('number')
  })
})
