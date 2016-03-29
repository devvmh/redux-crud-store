import {
  FETCH, FETCH_SUCCESS, FETCH_ERROR,
  FETCH_ONE, FETCH_ONE_SUCCESS, FETCH_ONE_ERROR,
  CREATE, CREATE_SUCCESS, CREATE_ERROR,
  UPDATE, UPDATE_SUCCESS, UPDATE_ERROR,
  DELETE, DELETE_SUCCESS, DELETE_ERROR,
  CLEAR_ACTION_STATUS, API_CALL
} from './actionTypes'

export function fetchCollection(model, path, params = {}) {
  return {
    type: FETCH,
    meta: {
      success: FETCH_SUCCESS,
      failure: FETCH_ERROR,
      params,
      model
    },
    payload: {
      method: 'get',
      path,
      params
    }
  }
}

export function fetchRecord(model, id, path, params = {}) {
  return {
    type: FETCH_ONE,
    meta: {
      success: FETCH_ONE_SUCCESS,
      failure: FETCH_ONE_ERROR,
      model,
      id
    },
    payload: {
      method: 'get',
      path,
      params
    }
  }
}

export function createRecord(model, path, data = {}, params = {}) {
  return {
    type: CREATE,
    meta: {
      success: CREATE_SUCCESS,
      failure: CREATE_ERROR,
      model
    },
    payload: {
      method: 'post',
      path,
      data,
      params
    }
  }
}

export function updateRecord(model, id, path, data = {}, params = {}) {
  return {
    type: UPDATE,
    meta: {
      success: UPDATE_SUCCESS,
      failure: UPDATE_ERROR,
      model,
      id
    },
    payload: {
      method: 'put',
      path,
      data,
      params
    }
  }
}

export function deleteRecord(model, id, path, params = {}) {
  return {
    type: DELETE,
    meta: {
      success: DELETE_SUCCESS,
      failure: DELETE_ERROR,
      model,
      id
    },
    payload: {
      method: 'del',
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

export function apiCall(success, failure, method, path, params = {}, data = undefined) {
  return {
    type: API_CALL,
    meta: {
      success,
      failure
    },
    payload: {
      method,
      path,
      params,
      data
    }
  }
}
