import 'babel-polyfill'
import { takeEvery } from 'redux-saga'
import { fork, put, call } from 'redux-saga/effects'

import {
  FETCH, FETCH_ONE, CREATE, UPDATE, DELETE, API_CALL, GARBAGE_COLLECT
} from './actionTypes'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

function* garbageCollector() {
  yield call(delay, 10 * 60 * 1000) // initial 10 minute delay
  for (;;) {
    yield call(delay, 5 * 60 * 1000) // every 5 minutes thereafter
    yield put({ type: GARBAGE_COLLECT, meta: { now: Date.now() } })
  }
}

const apiGeneric = (apiClient) => function* _apiGeneric(action) {
  const { method, path, params, data, fetchConfig } = action.payload
  const { success, failure } = action.meta

  action.meta.fetchTime = Date.now()

  try {
    const response = yield call(apiClient[method], path, { params, data, fetchConfig })
    yield put({ ...action, type: success, payload: response })
  } catch (error) {
    yield put({ ...action, type: failure, payload: error, error: true })
  }
}

const watchFetch = (apiClient) => function* _watchFetch() {
  yield* takeEvery(FETCH, apiGeneric(apiClient))
}

const watchFetchOne = (apiClient) => function* _watchFetchOne() {
  yield* takeEvery(FETCH_ONE, apiGeneric(apiClient))
}

const watchCreate = (apiClient) => function* _watchCreate() {
  yield* takeEvery(CREATE, apiGeneric(apiClient))
}

const watchUpdate = (apiClient) => function* _watchUpdate() {
  yield* takeEvery(UPDATE, apiGeneric(apiClient))
}

const watchDelete = (apiClient) => function* _watchDelete() {
  yield* takeEvery(DELETE, apiGeneric(apiClient))
}

const watchApiCall = (apiClient) => function* _watchApiCall() {
  yield* takeEvery(API_CALL, apiGeneric(apiClient))
}

export default function crudSaga(apiClient) {
  return function* _crudSaga() {
    yield [
      fork(watchFetch(apiClient)),
      fork(watchFetchOne(apiClient)),
      fork(watchCreate(apiClient)),
      fork(watchUpdate(apiClient)),
      fork(watchDelete(apiClient)),
      fork(watchApiCall(apiClient)),
      fork(garbageCollector)
    ]
  }
}
