/* @flow */
/* global T $Shape */

import {
  FETCH, FETCH_SUCCESS, FETCH_ERROR,
  FETCH_ONE, FETCH_ONE_SUCCESS, FETCH_ONE_ERROR,
  CREATE, CREATE_SUCCESS, CREATE_ERROR,
  UPDATE, UPDATE_SUCCESS, UPDATE_ERROR,
  DELETE, DELETE_SUCCESS, DELETE_ERROR,
  CLEAR_ACTION_STATUS, API_CALL, CLEAR_MODEL_DATA
} from './actionTypes'

import type {
  Action,
  ClearActionStatus,
  ClearModelDataAction,
  CrudAction,
  ID,
  Method
} from './actionTypes'

type Opts = {
  method?: Method,
}

export function fetchCollection<T>(model: string, path: string, params: Object = {}, opts: Opts = {}
                                  ): CrudAction<T[]> {
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

export function fetchRecord<T>(model: string, id: ID, path: string,
                               params: Object = {}, opts: Opts = {}
                              ): CrudAction<T> {
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

export function createRecord<T>(model: string, path: string, data: $Shape<T> = {},
                                params: Object = {}, opts: Opts = {}
                               ): CrudAction<T> {
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

export function updateRecord<T>(model: string, id: ID, path: string, data: $Shape<T> = {},
                                params: Object = {}, opts: Opts = {}
                               ): CrudAction<T> {
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

export function deleteRecord(model: string, id: ID, path: string,
                             params: Object = {}, opts: Opts = {}
                            ): CrudAction<void> {
  const method = opts.method || 'delete'
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

export function clearActionStatus(model: string, action: 'create' | 'update' | 'delete'
                                 ): ClearActionStatus {
  return {
    type: CLEAR_ACTION_STATUS,
    payload: { model, action }
  }
}

export function apiCall<T>(success: string, failure: string, method: Method, path: string,
                           params: Object = {}, data: $Shape<T> = undefined, opts: Object = {}
                          ): CrudAction<T> {
  const meta = opts.meta || {}
  return {
    type: API_CALL,
    meta: {
      ...meta,
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

export function clearModelData(model: string): ClearModelDataAction {
  return {
    type: CLEAR_MODEL_DATA,
    payload: {
      model
    }
  }
}
