/* eslint no-case-declarations: 0 */

import isEqual from 'lodash.isequal'
import devMessage from './devMessage'
import { cachePeriodAgo } from './cachePeriod'
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
function byIdReducerImpl(state = byIdInitialState, action) {
  const id = action.meta ? action.meta.id : undefined
  let newState // should only be used once per invocation
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
        [id]: state[id] === undefined ? undefined : {
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
      newState = Object.assign({}, state)
      delete newState[id]
      return newState
    case GARBAGE_COLLECT:
      newState = Object.assign({}, state)
      const cutoff = cachePeriodAgo(action.meta.now, action.meta.cachePeriod)
      Object.keys(state)
        .filter(key => newState[key].fetchTime < cutoff)
        .forEach(key => { delete newState[key] })
      return newState
    default:
      return state
  }
}

/*
 * Note: fetchTime of null means "needs fetch"
 */
function collectionReducerImpl(state = collectionInitialState, action) {
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
      const otherInfo = ('data' in originalPayload)
        ? Object.assign({}, originalPayload)
        : {}
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

function collectionsReducerImpl(state = collectionsInitialState, action,
                            { collectionReducer = collectionReducerImpl } = {}) {
  switch (action.type) {
    case FETCH:
    case FETCH_SUCCESS:
    case FETCH_ERROR:
      // create the collection for the given params if needed
      // entry will be undefined or [index, existingCollection]
      if (action.meta.params === undefined) {
        return state
      }
      const index = state.findIndex(coll => (
        isEqual(coll.params, action.meta.params)
      ))
      if (index === -1) {
        return state.concat([collectionReducer(undefined, action)])
      }

      return state.slice(0, index)
                  .concat([collectionReducer(state[index], action)])
                  .concat(state.slice(index + 1))
    case CREATE_SUCCESS:
    case DELETE_SUCCESS:
      // set fetchTime on all entries to null
      return state.map((item, idx) => (
        Object.assign({}, item, { fetchTime: null })
      ))
    case GARBAGE_COLLECT:
      return state.filter(collection => (
        collection.fetchTime > cachePeriodAgo(action.meta.now, action.meta.cachePeriod) ||
        collection.fetchTime === null
      ))
    default:
      return state
  }
}

function actionStatusReducerImpl(state = actionStatusInitialState, action) {
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

function modelReducerImpl(state = initialState, action,
                      { actionStatusReducer = actionStatusReducerImpl,
                        byIdReducer = byIdReducerImpl,
                        collectionsReducer = collectionsReducerImpl } = {}) {
  const id = action.meta ? action.meta.id : undefined
  switch (action.type) {
    case GARBAGE_COLLECT:
      return Object.assign({}, state, {
        collections: collectionsReducer(state.collections, action),
        byId: byIdReducer(state.byId, action)
      })
    case CLEAR_MODEL_DATA:
      return Object.assign({}, modelInitialState)
    case CLEAR_ACTION_STATUS:
      return Object.assign({}, state, {
        actionStatus: actionStatusReducer(state.actionStatus, action)
      })
    case FETCH:
    case FETCH_SUCCESS:
    case FETCH_ERROR:
      return Object.assign({}, state, {
        collections: collectionsReducer(state.collections, action),
        byId: byIdReducer(state.byId, action)
      })
    case FETCH_ONE:
    case FETCH_ONE_SUCCESS:
    case FETCH_ONE_ERROR:
      return Object.assign({}, state, {
        byId: byIdReducer(state.byId, action)
      })
    case CREATE:
      return Object.assign({}, state, {
        actionStatus: actionStatusReducer(state.actionStatus, action)
      })
    case CREATE_SUCCESS:
      return Object.assign({}, state, {
        collections: collectionsReducer(state.collections, action),
        byId: byIdReducer(state.byId, action),
        actionStatus: actionStatusReducer(state.actionStatus, action)
      })
    case CREATE_ERROR:
      return Object.assign({}, state, {
        actionStatus: actionStatusReducer(state.actionStatus, action)
      })
    case UPDATE:
    case UPDATE_SUCCESS:
    case UPDATE_ERROR:
      return Object.assign({}, state, {
        byId: byIdReducer(state.byId, action),
        actionStatus: actionStatusReducer(state.actionStatus, action)
      })
    case DELETE:
    case DELETE_SUCCESS:
    case DELETE_ERROR:
      return Object.assign({}, state, {
        collections: collectionsReducer(state.collections, action),
        byId: byIdReducer(state.byId, action),
        actionStatus: actionStatusReducer(state.actionStatus, action)
      })
    default:
      return state
  }
}

function crudReducer(state = initialState, action,
                     { actionStatusReducer = actionStatusReducerImpl,
                       byIdReducer = byIdReducerImpl,
                       collectionsReducer = collectionsReducerImpl } = {}) {
  switch (action.type) {
    case GARBAGE_COLLECT:
      return Object.keys(state).reduce((newState, model) => (
        Object.assign({}, newState, {
          [model]: modelReducerImpl(state[model], action, {
            actionStatusReducer, byIdReducer, collectionsReducer
          })
        })
      ), {})
    case CLEAR_MODEL_DATA:
    case CLEAR_ACTION_STATUS:
    case FETCH:
    case FETCH_SUCCESS:
    case FETCH_ERROR:
    case FETCH_ONE:
    case FETCH_ONE_SUCCESS:
    case FETCH_ONE_ERROR:
    case CREATE:
    case CREATE_SUCCESS:
    case CREATE_ERROR:
    case UPDATE:
    case UPDATE_SUCCESS:
    case UPDATE_ERROR:
    case DELETE:
    case DELETE_SUCCESS:
    case DELETE_ERROR:
      const model = action.meta && action.meta.model || action.payload.model
      return Object.assign({}, state, {
        [model]: modelReducerImpl(state[model], action, {
          actionStatusReducer, byIdReducer, collectionsReducer
        })
      })
    default:
      return state
  }
}

export { byIdReducerImpl as byIdReducer }
export { collectionReducerImpl as collectionReducer }
export { collectionsReducerImpl as collectionsReducer }
export { actionStatusReducerImpl as actionStatusReducer }
export { modelReducerImpl as modelReducer }
export default crudReducer
