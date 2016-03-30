import {
  FETCH, FETCH_SUCCESS, FETCH_ERROR,
  FETCH_ONE, FETCH_ONE_SUCCESS, FETCH_ONE_ERROR,
  CREATE, CREATE_SUCCESS, CREATE_ERROR,
  UPDATE, UPDATE_SUCCESS, UPDATE_ERROR,
  DELETE, DELETE_SUCCESS, DELETE_ERROR,
  CLEAR_ACTION_STATUS, API_CALL
} from './actionTypes'

export function fetchCollection(model, path, params = {}, opts = {}) {
  const method = opts.method || 'get'
  return {
    type: FETCH,
    meta: {
      success: FETCH_SUCCESS,
      failure: FETCH_ERROR,
      params,
      model
    },
    payload: {
      method,
      path,
      params
    }
  }
}

export function fetchRecord(model, id, path, params = {}, opts = {}) {
  const method = opts.method || 'get'
  return {
    type: FETCH_ONE,
    meta: {
      success: FETCH_ONE_SUCCESS,
      failure: FETCH_ONE_ERROR,
      model,
      id
    },
    payload: {
      method,
      path,
      params
    }
  }
}

export function createRecord(model, path, data = {}, params = {}, opts = {}) {
  const method = opts.method || 'post'
  return {
    type: CREATE,
    meta: {
      success: CREATE_SUCCESS,
      failure: CREATE_ERROR,
      model
    },
    payload: {
      method,
      path,
      data,
      params
    }
  }
}

export function updateRecord(model, id, path, data = {}, params = {}, opts = {}) {
  const method = opts.method || 'put'
  return {
    type: UPDATE,
    meta: {
      success: UPDATE_SUCCESS,
      failure: UPDATE_ERROR,
      model,
      id
    },
    payload: {
      method,
      path,
      data,
      params
    }
  }
}

export function deleteRecord(model, id, path, params = {}, opts = {}) {
  const method = opts.method || 'del'
  return {
    type: DELETE,
    meta: {
      success: DELETE_SUCCESS,
      failure: DELETE_ERROR,
      model,
      id
    },
    payload: {
      method,
      path,
      params
    }
  }
}

export function clearActionStatus(model, action) {
  return {
    type: CLEAR_ACTION_STATUS,
    payload: { model, action }
  }
}

export function apiCall(success, failure, method, path, params = {}, data = undefined, opts = {}) {
  const meta = opts.meta || {}
  return {
    type: API_CALL,
    meta: {
      ...meta,
      success,
      failure,
    },
    payload: {
      method,
      path,
      params,
      data
    }
  }
}
