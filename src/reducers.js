/* eslint no-case-declarations: 0 */

import { fromJS } from 'immutable'
import isEqual from 'lodash.isequal'
import {
  FETCH, FETCH_SUCCESS, FETCH_ERROR,
  FETCH_ONE, FETCH_ONE_SUCCESS, FETCH_ONE_ERROR,
  CREATE, CREATE_SUCCESS, CREATE_ERROR,
  UPDATE, UPDATE_SUCCESS, UPDATE_ERROR,
  DELETE, DELETE_SUCCESS, DELETE_ERROR,
  CLEAR_ACTION_STATUS, API_CALL, GARBAGE_COLLECT,
  CLEAR_MODEL_DATA
} from './actionTypes'

/*
 * SECTION: initial states
 */

const byIdInitialState = fromJS({})

const collectionInitialState = fromJS({
  params: {},
  otherInfo: {},
  ids: [],
  fetchTime: null,
  error: null
})

const collectionsInitialState = fromJS([])

const actionStatusInitialState = fromJS({
  create: {},
  update: {},
  delete: {}
})

export const modelInitialState = fromJS({
  byId: byIdInitialState,
  collections: collectionsInitialState,
  actionStatus: actionStatusInitialState
})

// holds a number of models, each of which are strucured like modelInitialState
const initialState = fromJS({})

/*
 * SECTION: reducers
 */

// server data is canonical, so blast away the old data
export function byIdReducer(state = byIdInitialState, action) {
  const id = action.meta ? action.meta.id : undefined
  switch (action.type) {
    case FETCH_SUCCESS:
      const data = state.toJS()
      const payload = ('data' in action.payload) ? action.payload.data : action.payload
      payload.forEach((record) => {
        data[record.id] = {
          record,
          fetchTime: action.meta.fetchTime,
          error: null
        }
      })
      return fromJS(data)
    case FETCH_ONE:
      return state.setIn([id.toString(), 'fetchTime'], 0)
                  .setIn([id.toString(), 'error'], null)
                  .setIn([id.toString(), 'record'], null)
    case FETCH_ONE_SUCCESS:
      return state.setIn([id.toString(), 'fetchTime'], action.meta.fetchTime)
                  .setIn([id.toString(), 'error'], null)
                  .setIn([id.toString(), 'record'], fromJS(action.payload))
    case FETCH_ONE_ERROR:
      return state.setIn([id.toString(), 'fetchTime'], action.meta.fetchTime)
                  .setIn([id.toString(), 'error'], action.payload)
                  .setIn([id.toString(), 'record'], null)
    case CREATE_SUCCESS:
      const cid = action.payload.id
      return state.set(action.payload.id.toString(), fromJS({
        record: action.payload,
        fetchTime: action.meta.fetchTime,
        error: null
      }))
    case UPDATE:
      return state.setIn([id.toString(), 'fetchTime'], 0)
    case UPDATE_SUCCESS:
      return state.set(id.toString(), fromJS({
        record: action.payload,
        fetchTime: action.meta.fetchTime,
        error: null
      }))
    case DELETE_SUCCESS:
      return state.delete(id.toString())
    case GARBAGE_COLLECT:
      const tenMinutesAgo = action.meta.now - 10 * 60 * 1000
      return state.filter((record, _id) => (
        record.get('fetchTime') > tenMinutesAgo
      ))
    default:
      return state
  }
}

/*
 * Note: fetchTime of null means "needs fetch"
 */
export function collectionReducer(state = collectionInitialState, action) {
  switch (action.type) {
    case FETCH:
      return state.set('params', fromJS(action.meta.params))
                  .set('fetchTime', 0)
                  .set('error', null)
    case FETCH_SUCCESS:
      const originalPayload = action.payload || {}
      const payload = ('data' in originalPayload) ? action.payload.data : action.payload
      const otherInfo = ('data' in originalPayload) ? originalPayload : {}
      const ids = payload.map((elt) => elt.id)
      return state.set('params', fromJS(action.meta.params))
                  .set('ids', fromJS(ids))
                  .set('otherInfo', fromJS(otherInfo).delete('data'))
                  .set('error', null)
                  .set('fetchTime', action.meta.fetchTime)
    case FETCH_ERROR:
      return state.set('params', fromJS(action.meta.params))
                  .set('error', action.payload)
    default:
      return state
  }
}

export function collectionsReducer(state = collectionsInitialState, action,
                                   { collectionReducer = collectionReducer } = {}) {
  switch (action.type) {
    case FETCH:
    case FETCH_SUCCESS:
    case FETCH_ERROR:
      // create the collection for the given params if needed
      // entry will be undefined or [index, existingCollection]
      if (action.meta.params === undefined) {
        return state
      }
      const entry = state.findEntry(coll => (
        isEqual(coll.toJS().params, action.meta.params)
      ))
      if (entry === undefined) {
        return state.push(collectionReducer(undefined, action))
      }
      const [index, existingCollection] = entry
      return state.update(index, s => collectionReducer(s, action))
    case CREATE_SUCCESS:
    case DELETE_SUCCESS:
      // set fetchTime on all entries to null
      return state.map((item, idx) => (
        item.set('fetchTime', null)
      ))

    case GARBAGE_COLLECT:
      const tenMinutesAgo = action.meta.now - 10 * 60 * 1000
      return state.filter(collection => (
        collection.get('fetchTime') > tenMinutesAgo ||
          collection.get('fetchTime') === null
      ))
    default:
      return state
  }
}

export function actionStatusReducer(state = actionStatusInitialState, action) {
  switch (action.type) {
    case CLEAR_ACTION_STATUS:
      return state.set(action.payload.action, fromJS({}))
    case CREATE:
      return state.set('create', fromJS({
        pending: true,
        id: null
      }))
    case CREATE_SUCCESS:
    case CREATE_ERROR:
      return state.set('create', fromJS({
        pending: false,
        id: action.payload.id,
        isSuccess: !action.error,
        payload: action.payload
      }))
    case UPDATE:
      return state.set('update', fromJS({
        pending: true,
        id: action.meta.id
      }))
    case UPDATE_SUCCESS:
    case UPDATE_ERROR:
      return state.set('update', fromJS({
        pending: false,
        id: action.meta.id,
        isSuccess: !action.error,
        payload: action.payload
      }))
    case DELETE:
      return state.set('delete', fromJS({
        pending: true,
        id: action.meta.id
      }))
    case DELETE_SUCCESS:
    case DELETE_ERROR:
      return state.set('delete', fromJS({
        pending: false,
        id: action.meta.id,
        isSuccess: !action.error,
        payload: action.payload // probably null...
      }))
    default:
      return state
  }
}

export default function crudReducer(state = initialState, action,
                                    { actionStatusReducer = actionStatusReducer,
                                      byIdReducer = byIdReducer,
                                      collectionsReducer = collectionsReducer } = {}) {
  const id = action.meta ? action.meta.id : undefined
  switch (action.type) {
    case CLEAR_MODEL_DATA:
      return state.set(action.payload.model, modelInitialState)
    case CLEAR_ACTION_STATUS:
      return state.updateIn([action.payload.model, 'actionStatus'],
                          (s) => actionStatusReducer(s, action))
    case GARBAGE_COLLECT:
      return state.map(model => (
               model.update('collections',
                            (s) => collectionsReducer(s, action))
                    .update('byId',
                            (s) => byIdReducer(s, action))
             ))
    case FETCH:
    case FETCH_SUCCESS:
    case FETCH_ERROR:
      return state.updateIn([action.meta.model, 'collections'],
                            (s) => collectionsReducer(s, action))
                  .updateIn([action.meta.model, 'byId'],
                            (s) => byIdReducer(s, action))
    case FETCH_ONE:
    case FETCH_ONE_SUCCESS:
    case FETCH_ONE_ERROR:
      return state.updateIn([action.meta.model, 'byId'],
                            (s) => byIdReducer(s, action))
    case CREATE:
      return state.updateIn([action.meta.model, 'actionStatus'],
                            (s) => actionStatusReducer(s, action))
    case CREATE_SUCCESS:
      return state.updateIn([action.meta.model, 'byId'],
                            (s) => byIdReducer(s, action))
                  .updateIn([action.meta.model, 'collections'],
                            fromJS([]),
                            (s) => collectionsReducer(s, action))
                  .updateIn([action.meta.model, 'actionStatus'],
                            (s) => actionStatusReducer(s, action))
    case CREATE_ERROR:
      return state.updateIn([action.meta.model, 'actionStatus'],
                            (s) => actionStatusReducer(s, action))
    case UPDATE:
    case UPDATE_SUCCESS:
    case UPDATE_ERROR:
      return state.updateIn([action.meta.model, 'byId'],
                            (s) => byIdReducer(s, action))
                  .updateIn([action.meta.model, 'actionStatus'],
                            (s) => actionStatusReducer(s, action))
    case DELETE:
    case DELETE_SUCCESS:
    case DELETE_ERROR:
      return state.updateIn([action.meta.model, 'byId'],
                            (s) => byIdReducer(s, action))
                  .updateIn([action.meta.model, 'collections'],
                            fromJS([]),
                            (s) => collectionsReducer(s, action))
                  .updateIn([action.meta.model, 'actionStatus'],
                            (s) => actionStatusReducer(s, action))
    default:
      return state
  }
}
