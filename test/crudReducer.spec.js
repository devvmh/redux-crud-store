import expect from 'expect'
import { fromJS } from 'immutable'
import crudReducer, { modelInitialState } from '../src/reducers.js'
import {
  CLEAR_MODEL_DATA, CLEAR_ACTION_STATUS, GARBAGE_COLLECT,
  FETCH, FETCH_SUCCESS, FETCH_ERROR,
  FETCH_ONE, FETCH_ONE_SUCCESS, FETCH_ONE_ERROR,
  CREATE, CREATE_SUCCESS, CREATE_ERROR,
  UPDATE, UPDATE_SUCCESS, UPDATE_ERROR,
  DELETE, DELETE_SUCCESS, DELETE_ERROR
} from '../src/actionTypes'

const testModelInitialState = {
  byId: { initial: 'data' },
  collections: [1],
  actionStatus: {}
}
const initialState = fromJS({
  widgets: testModelInitialState
})


describe('crudReducer', () => {
  describe('CLEAR_MODEL_DATA', () => {
    it('resets an existing model', () => {
      const action = { type: CLEAR_MODEL_DATA, payload: { model: 'widgets' } }
      const newState = crudReducer(initialState, action)
      expect(newState.toJS().widgets).toEqual(modelInitialState.toJS())
    })
    it('creates a blank model if not already present', () => {
      const action = { type: CLEAR_MODEL_DATA, payload: { model: 'posts' } }
      const newState = crudReducer(initialState, action)
      expect(newState.toJS().posts).toEqual(modelInitialState.toJS())
    })
  })
  describe('CLEAR_ACTION_STATUS', () => {
    it('calls actionStatusReducer for the appropriate model', () => {
      const expectedData = { create: { other: 'new data' } }
      const actionStatusReducer = expect.createSpy().andReturn(expectedData)
      const action = { type: CLEAR_ACTION_STATUS, payload: { model: 'widgets' } }

      const newState = crudReducer(initialState, action, { actionStatusReducer })

      expect(newState.toJS().widgets.actionStatus).toEqual(expectedData)
      expect(actionStatusReducer).toHaveBeenCalledWith(fromJS({}), action)
    })
  })
})
