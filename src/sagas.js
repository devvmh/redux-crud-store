/* @flow */
/* global Generator */

import { all, call, fork, put, takeEvery } from 'redux-saga/effects'

import { cachePeriod, halfCachePeriod } from './cachePeriod'
import {
  FETCH, FETCH_ONE, CREATE, UPDATE, DELETE, API_CALL, GARBAGE_COLLECT
} from './actionTypes'

// TODO: The `Effect` type is not actually defined. Because 'redux-saga' does
// not use @flow annotations, flow pretends that this import succeeds.
import type { Effect } from 'redux-saga'
import type { CrudAction } from './actionTypes'

// Generator type parameters are: Generator<+Yield,+Return,-Next>

// NOTE: need to avoid hoisting generator functions or they'll happen
// before this definition. See garbageCollector definition below, e.g.
const regeneratorRuntime = require('regenerator-runtime')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const garbageCollector = function* garbageCollector() {
  yield call(delay, cachePeriod) // initial delay of cache period (default 10 minutes)
  for (;;) {
    yield call(delay, halfCachePeriod) // every 1/2 cache period thereafter (default 5 minutes)
    yield put({ type: GARBAGE_COLLECT, meta: { now: Date.now() } })
  }
}

export const apiGeneric = (apiClient: Object) =>
function* _apiGeneric(action: CrudAction<any>): Generator<Effect, void, any> {
  const { method, path, params, data, fetchConfig } = action.payload
  const { success, failure } = action.meta
  const meta = {
    ...action.meta,
    fetchTime: Date.now()
  }

  try {
    const response = yield call(apiClient[method], path, { params, data, fetchConfig })
    yield put({ meta, type: success, payload: response })
  } catch (error) {
    yield put({ meta, type: failure, payload: error, error: true })
  }
}

const watchFetch = (apiClient) => function* _watchFetch() {
  yield takeEvery(FETCH, apiGeneric(apiClient))
}

const watchFetchOne = (apiClient) => function* _watchFetchOne() {
  yield takeEvery(FETCH_ONE, apiGeneric(apiClient))
}

const watchCreate = (apiClient) => function* _watchCreate() {
  yield takeEvery(CREATE, apiGeneric(apiClient))
}

const watchUpdate = (apiClient) => function* _watchUpdate() {
  yield takeEvery(UPDATE, apiGeneric(apiClient))
}

const watchDelete = (apiClient) => function* _watchDelete() {
  yield takeEvery(DELETE, apiGeneric(apiClient))
}

const watchApiCall = (apiClient) => function* _watchApiCall() {
  yield takeEvery(API_CALL, apiGeneric(apiClient))
}

export default function crudSaga(apiClient: Object) {
  return function* _crudSaga(): Generator<Effect, void, any> {
    yield all([
      fork(watchFetch(apiClient)),
      fork(watchFetchOne(apiClient)),
      fork(watchCreate(apiClient)),
      fork(watchUpdate(apiClient)),
      fork(watchDelete(apiClient)),
      fork(watchApiCall(apiClient)),
      fork(garbageCollector)
    ])
  }
}
