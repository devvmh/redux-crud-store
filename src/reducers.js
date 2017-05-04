/* eslint no-case-declarations: 0 */

import { fromJS } from 'immutable'
import isEqual from 'lodash.isequal'
import devMessage from './devMessage'
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

const byIdInitialState = {}

const collectionInitialState = {
  params: {},
  otherInfo: {},
  ids: [],
  fetchTime: null,
  error: null
}

const collectionsInitialState = []

const actionStatusInitialState = {
  create: {},
  update: {},
  delete: {}
}

export const modelInitialState = {
  byId: byIdInitialState,
  collections: collectionsInitialState,
  actionStatus: actionStatusInitialState
}

// holds a number of models, each of which are strucured like modelInitialState
const initialState = {}

/*
 * SECTION: reducers
 */

// server data is canonical, so blast away the old data
export function byIdReducer(state = byIdInitialState, action) {
  const id = action.meta ? action.meta.id : undefined
  switch (action.type) {
    case FETCH_SUCCESS:
      const data = {}
      const payload = ('data' in action.payload) ? action.payload.data : action.payload
      payload.forEach((record) => {
        data[record.id] = {
          fetchTime: action.meta.fetchTime,
          error: null,
          record
        }
      })
      return Object.assign({}, state, data)
    case FETCH_ONE:
      return Object.assign({}, state, {
        [id]: {
          fetchTime: 0,
          error: null,
          record: null
        }
      })
    case FETCH_ONE_SUCCESS:
      return Object.assign({}, state, {
        [id]: {
          fetchTime: action.meta.fetchTime,
          error: null,
          record: action.payload
        }
      })
    case FETCH_ONE_ERROR:
      return Object.assign({}, state, {
        [id]: {
          fetchTime: action.meta.fetchTime,
          error: action.payload,
          record: null
        }
      })
    case CREATE_SUCCESS:
      return Object.assign({}, state, {
        [action.payload.id]: {
          fetchTime: action.meta.fetchTime,
          error: null,
          record: action.payload
        }
      })
    case UPDATE:
      return Object.assign({}, state, {
        [id]: {
          fetchTime: 0,
          error: state[id].error,
          record: state[id].record
        }
      })
    case UPDATE_SUCCESS:
      return Object.assign({}, state, {
        [id]: {
          fetchTime: action.meta.fetchTime,
          error: null,
          record: action.payload
        }
      })
    case DELETE_SUCCESS:
      const newState = Object.assign({}, state)
      delete newState[id]
      return newState
    case GARBAGE_COLLECT:
      const tenMinutesAgo = action.meta.now - 10 * 60 * 1000
      const newState = Object.assign({}, state)
      Object.keys(state)
        .filter(id => newState[id].fetchTime > tenMinutesAgo)
        .forEach(id => { delete newState[id] })
      return newState
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
      return Object.assign({}, state, {
        params: action.meta.params,
        fetchTime: 0,
        error: null
      })
    case FETCH_SUCCESS:
      const originalPayload = action.payload || {}
      const payload = ('data' in originalPayload) ? originalPayload.data : originalPayload
      const otherInfo = ('data' in originalPayload) ? originalPayload : {}
      delete otherInfo.data
      if (!Array.isArray(payload)) {
        devMessage(`
          Payload is not an array! Your server response for a FETCH action
          should be in one of the following forms:

          { data: [ ... ] }

          or

          [ ... ]
        
          Here are the contents of your action:`)
        devMessage(JSON.stringify(action))
      }
      const ids = payload.map((elt) => elt.id)
      return Object.assign({}, state, {
        params: action.meta.params,
        ids,
        otherInfo, 
        error: null,
        fetchTime: action.meta.fetchTime
      })
    case FETCH_ERROR:
      return Object.assign({}, state, {
        params: action.meta.params,
        error: action.payload
      })
    default:
      return state
  }
}

/* eslint-disable no-shadow, no-use-before-define */
export function collectionsReducer(state = collectionsInitialState, action,
                                   { collectionReducer = collectionReducer } = {}) {
/* eslint-enable no-shadow, no-use-before-define */
  switch (action.type) {
    case FETCH:
    case FETCH_SUCCESS:
    case FETCH_ERROR:
      // create the collection for the given params if needed
      // entry will be undefined or [index, existingCollection]
      if (action.meta.params === undefined) {
        return state
      }
      const entry = state.find(coll => (
        isEqual(coll, action.meta.params)
      ))
      if (entry === undefined) {
        return state.concat([collectionReducer(undefined, action)])
      }
      const [index, existingCollection] = entry

      return state.slice(0, index)
                  .concat([collectionReducer(state[index], action)])
                  .concat(state.slice(index + 1))
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
      return Object.assign({}, state, {
        [action.payload.action]: {}
      })
    case CREATE:
      return Object.assign({}, state, {
        create: {
          pending: true,
          id: null
        }
      })
    case CREATE_SUCCESS:
    case CREATE_ERROR:
      return Object.assign({}, state, {
        create: {
          pending: false,
          id: action.payload.id,
          isSuccess: !action.error,
          payload: action.payload
        }
      })
    case UPDATE:
      return Object.assign({}, state, {
        update: {
          pending: true,
          id: action.meta.id
        }
      })
    case UPDATE_SUCCESS:
    case UPDATE_ERROR:
      return Object.assign({}, state, {
        update: {
          pending: false,
          id: action.meta.id,
          isSuccess: !action.error,
          payload: action.payload
        }
      })
    case DELETE:
      return Object.assign({}, state, {
        delete: {
          pending: true,
          id: action.meta.id
        }
      })
    case DELETE_SUCCESS:
    case DELETE_ERROR:
      return Object.assign({}, state, {
        delete: {
          pending: false,
          id: action.meta.id,
          isSuccess: !action.error,
          payload: action.payload // probably null...
        } 
      })
    default:
      return state
  }
}

/* eslint-disable no-shadow, no-use-before-define */
export default function crudReducer(state = initialState, action,
                                    { actionStatusReducer = actionStatusReducer,
                                      byIdReducer = byIdReducer,
                                      collectionsReducer = collectionsReducer } = {}) {
/* eslint-enable no-shadow, no-use-before-define */
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
