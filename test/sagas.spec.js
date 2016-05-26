/* @flow */

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

describe('apiGeneric', () => {
  it('invokes API client methods', () => {
    const gen = apiGeneric(apiClient)(fetchWidgets(1))
    const apiCall = gen.next().value
    expect(apiCall).toEqual(
      call(apiClient.get, '/widgets', { params: { page: 1 }, data: undefined })
    )
  })
  it('dispatches success event', () => {
    const gen = apiGeneric(apiClient)(fetchWidgets(1))
    const apiCall = gen.next().value
    const putSuccess = gen.next(widgets).value
    if (!putSuccess) { throw new Error('undefined yield value') }  // Flow wants this check
    expect(putSuccess.PUT).toExist()
    expect(putSuccess.PUT.action.type).toEqual(FETCH_SUCCESS)
    expect(putSuccess.PUT.action.payload).toEqual(widgets)
  })
  it('dispatches error event', () => {
    const error = new Error('fetch failed')
    const gen = apiGeneric(apiClient)(fetchWidgets(1))
    const apiCall = gen.next().value
    const putError = gen.throw(error).value
    if (!putError) { throw new Error('undefined yield value') }  // Flow wants this check
    expect(putError.PUT).toExist()
    expect(putError.PUT.action.type).toEqual(FETCH_ERROR)
    expect(putError.PUT.action.payload).toBe(error)
  })
  it('attaches `fetchTime` property to dispatched action meta', () => {
    const gen = apiGeneric(apiClient)(fetchWidgets(1))
    const apiCall = gen.next().value
    const putSuccess = gen.next(widgets).value
    if (!putSuccess) { throw new Error('undefined yield value') }  // Flow wants this check
    expect(putSuccess.PUT.action.meta.fetchTime).toBeA('number')
  })
})
