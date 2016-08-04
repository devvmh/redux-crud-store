/* @flow */
/* global T */
/* eslint max-len: 0, no-multi-spaces: 0, no-use-before-define: 0 */

export const FETCH               : 'redux-crud-store/crud/FETCH'               = 'redux-crud-store/crud/FETCH'
export const FETCH_SUCCESS       : 'redux-crud-store/crud/FETCH_SUCCESS'       = 'redux-crud-store/crud/FETCH_SUCCESS'
export const FETCH_ERROR         : 'redux-crud-store/crud/FETCH_ERROR'         = 'redux-crud-store/crud/FETCH_ERROR'
export const FETCH_ONE           : 'redux-crud-store/crud/FETCH_ONE'           = 'redux-crud-store/crud/FETCH_ONE'
export const FETCH_ONE_SUCCESS   : 'redux-crud-store/crud/FETCH_ONE_SUCCESS'   = 'redux-crud-store/crud/FETCH_ONE_SUCCESS'
export const FETCH_ONE_ERROR     : 'redux-crud-store/crud/FETCH_ONE_ERROR'     = 'redux-crud-store/crud/FETCH_ONE_ERROR'
export const CREATE              : 'redux-crud-store/crud/CREATE'              = 'redux-crud-store/crud/CREATE'
export const CREATE_SUCCESS      : 'redux-crud-store/crud/CREATE_SUCCESS'      = 'redux-crud-store/crud/CREATE_SUCCESS'
export const CREATE_ERROR        : 'redux-crud-store/crud/CREATE_ERROR'        = 'redux-crud-store/crud/CREATE_ERROR'
export const UPDATE              : 'redux-crud-store/crud/UPDATE'              = 'redux-crud-store/crud/UPDATE'
export const UPDATE_SUCCESS      : 'redux-crud-store/crud/UPDATE_SUCCESS'      = 'redux-crud-store/crud/UPDATE_SUCCESS'
export const UPDATE_ERROR        : 'redux-crud-store/crud/UPDATE_ERROR'        = 'redux-crud-store/crud/UPDATE_ERROR'
export const DELETE              : 'redux-crud-store/crud/DELETE'              = 'redux-crud-store/crud/DELETE'
export const DELETE_SUCCESS      : 'redux-crud-store/crud/DELETE_SUCCESS'      = 'redux-crud-store/crud/DELETE_SUCCESS'
export const DELETE_ERROR        : 'redux-crud-store/crud/DELETE_ERROR'        = 'redux-crud-store/crud/DELETE_ERROR'
export const CLEAR_ACTION_STATUS : 'redux-crud-store/crud/CLEAR_ACTION_STATUS' = 'redux-crud-store/crud/CLEAR_ACTION_STATUS'
export const API_CALL            : 'redux-crud-store/crud/API_CALL'            = 'redux-crud-store/crud/API_CALL'
export const GARBAGE_COLLECT     : 'redux-crud-store/crud/GARBAGE_COLLECT'     = 'redux-crud-store/crud/GARBAGE_COLLECT'
export const CLEAR_MODEL_DATA    : 'redux-crud-store/crud/CLEAR_MODEL_DATA'    = 'redux-crud-store/crud/CLEAR_MODEL_DATA'

export type Action =
  | ClearActionStatus
  | CrudAction<any>
  | Success<any>
  | Failure

export type CrudAction<T> = {
  type: typeof FETCH | typeof FETCH_ONE | typeof CREATE | typeof UPDATE | typeof DELETE | typeof API_CALL,
  meta: Meta,
  payload: {
    method: Method,
    path:   string,
    data?:  T,
    params: Object,
    fetchConfig?: Object,
  },
}

export type Success<T:{ id: ID }> = {
  type: typeof FETCH_SUCCESS | typeof FETCH_ONE_SUCCESS | typeof CREATE_SUCCESS | typeof UPDATE_SUCCESS | typeof DELETE_SUCCESS,
  meta: Meta,
  payload: T | {
    data: T,
  },
  error?: boolean,
}

export type Failure = {
  type: typeof FETCH_ERROR | typeof FETCH_ONE_ERROR | typeof CREATE_ERROR | typeof UPDATE_ERROR | typeof DELETE_ERROR,
  meta: Meta,
  payload: Error,
  error: true,
}

export type Meta = {
  success:    string,
  failure:    string,
  params?:    Object,
  model:      Model,
  id?:        ID,
  fetchTime?: number,
}


export type ClearActionStatus = {
  type: typeof CLEAR_ACTION_STATUS,
  payload: {
    model: Model,
    action: 'create' | 'update' | 'delete',
  }
}

export type GarbageCollect = {
  type: typeof GARBAGE_COLLECT,
  meta: {
    now: number,
  }
}

export type ClearModelDataAction = {
  type: typeof CLEAR_MODEL_DATA,
  payload: {
    model: Model,
  }
}

export type ID = string | number
export type Method = 'get' | 'post' | 'put' | 'delete'
export type Model = string
