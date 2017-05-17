import expect from 'expect'
import { actionStatusReducer } from '../src/reducers.js'
import deepFreeze from 'deep-freeze'
import {
  CLEAR_ACTION_STATUS,
  CREATE, CREATE_SUCCESS, CREATE_ERROR,
  UPDATE, UPDATE_SUCCESS, UPDATE_ERROR,
  DELETE, DELETE_SUCCESS, DELETE_ERROR
} from '../src/actionTypes'

const initialState = {
  create: { test: 'data' },
  update: { test: 'data2' },
  delete: { test: 'data3' }
}
deepFreeze(initialState)

const actionsList = [
  { statusKey: 'create', actionString: 'CREATE',
    initAction: CREATE, successAction: CREATE_SUCCESS, errorAction: CREATE_ERROR },
  { statusKey: 'update', actionString: 'UPDATE',
    initAction: UPDATE, successAction: UPDATE_SUCCESS, errorAction: UPDATE_ERROR },
  { statusKey: 'delete', actionString: 'DELETE',
    initAction: DELETE, successAction: DELETE_SUCCESS, errorAction: DELETE_ERROR }
]

describe('actionStatusReducer', () => {
  describe('CLEAR_ACTION_STATUS', () => {
    actionsList.forEach(({ statusKey }) => {
      it(`clears status for ${statusKey} actions`, () => {
        const action = { type: CLEAR_ACTION_STATUS, payload: { action: statusKey } }
        const newState = actionStatusReducer(initialState, action)
        expect(newState[statusKey]).toEqual({})
      })
    })
  })
  describe('init actions', () => {
    actionsList.forEach(({ initAction, statusKey, actionString }) => {
      it(`${actionString} sets id and sets pending to true`, () => {
        const meta = initAction === CREATE ? undefined : { id: 1 }
        const action = { type: initAction, meta }
        const newState = actionStatusReducer(initialState, action)
        expect(newState[statusKey].pending).toEqual(true)
        expect(newState[statusKey].id).toEqual(initAction === CREATE ? null : 1)
      })
    })
  })
  describe('success actions', () => {
    actionsList.forEach(({ successAction, statusKey, actionString }) => {
      it(`${actionString}_SUCCESS sets payload, etc`, () => {
        const payload = { payload: true, id: 1 }
        const action = { type: successAction, meta: { id: 1 }, payload, error: false }
        const newState = actionStatusReducer(initialState, action)
        const statusObject = newState[statusKey]
        expect(statusObject.pending).toEqual(false)
        expect(statusObject.id).toEqual(1)
        expect(statusObject.isSuccess).toEqual(true)
        expect(statusObject.payload).toEqual(payload)
      })
    })
  })
  describe('error actions', () => {
    actionsList.forEach(({ errorAction, statusKey, actionString }) => {
      it(`${actionString}_ERROR sets error, etc`, () => {
        const error = { error: 'error data' }
        const action = { type: errorAction, meta: { id: 1 }, payload: error, error: true }
        const newState = actionStatusReducer(initialState, action)
        const statusObject = newState[statusKey]
        expect(statusObject.pending).toEqual(false)
        expect(statusObject.id).toEqual(errorAction === CREATE_ERROR ? undefined : 1)
        expect(statusObject.isSuccess).toEqual(false)
        expect(statusObject.payload).toEqual(error)
      })
    })
  })
})
