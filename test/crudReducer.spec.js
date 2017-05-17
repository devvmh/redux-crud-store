import expect from 'expect'
import crudReducer, { modelInitialState } from '../src/reducers.js'
import deepFreeze from 'deep-freeze'
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
const initialState = {
  widgets: testModelInitialState
}
deepFreeze(initialState)

describe('crudReducer', () => {
  describe('CLEAR_MODEL_DATA', () => {
    it('resets an existing model', () => {
      const action = { type: CLEAR_MODEL_DATA, payload: { model: 'widgets' } }
      const newState = crudReducer(initialState, action)
      expect(newState.widgets).toEqual(modelInitialState)
    })
    it('creates a blank model if not already present', () => {
      const action = { type: CLEAR_MODEL_DATA, payload: { model: 'posts' } }
      const newState = crudReducer(initialState, action)
      expect(newState.posts).toEqual(modelInitialState)
    })
  })

  describe('CLEAR_ACTION_STATUS', () => {
    it('calls actionStatusReducer for the appropriate model', () => {
      const expectedData = { create: { other: 'new data' } }
      const actionStatusReducer = expect.createSpy().andReturn(expectedData)
      const action = { type: CLEAR_ACTION_STATUS, payload: { model: 'widgets' } }

      const newState = crudReducer(initialState, action, { actionStatusReducer })

      expect(newState.widgets.actionStatus).toEqual(expectedData)
      expect(actionStatusReducer).toHaveBeenCalledWith({}, action)
    })
  })

  const fetchActionsList = [
    { actionType: FETCH, actionString: 'FETCH' },
    { actionType: FETCH_SUCCESS, actionString: 'FETCH_SUCCESS' },
    { actionType: FETCH_ERROR, actionString: 'FETCH_ERROR' }
  ]
  fetchActionsList.forEach(({ actionType, actionString }) => {
    describe(actionString, () => {
      it('updates byId and collections', () => {
        const expectedCollections = { some: 'collections data' }
        const expectedById = { some: 'byId data' }
        const collectionsReducer = expect.createSpy().andReturn(expectedCollections)
        const byIdReducer = expect.createSpy().andReturn(expectedById)
        const action = { type: actionType, meta: { model: 'widgets' } }

        const newState = crudReducer(initialState, action, { collectionsReducer, byIdReducer })

        expect(newState.widgets.collections).toEqual(expectedCollections)
        expect(newState.widgets.byId).toEqual(expectedById)
      })
    })
  })

  const fetchOneActionsList = [
    { actionType: FETCH_ONE, actionString: 'FETCH_ONE' },
    { actionType: FETCH_ONE_SUCCESS, actionString: 'FETCH_ONE_SUCCESS' },
    { actionType: FETCH_ONE_ERROR, actionString: 'FETCH_ONE_ERROR' }
  ]
  fetchOneActionsList.forEach(({ actionType, actionString }) => {
    describe(actionString, () => {
      it('updates byId', () => {
        const expectedById = { some: 'byId data' }
        const byIdReducer = expect.createSpy().andReturn(expectedById)
        const action = { type: actionType, meta: { model: 'widgets' } }

        const newState = crudReducer(initialState, action, { byIdReducer })

        expect(newState.widgets.byId).toEqual(expectedById)
      })
    })
  })

  // CREATE_SUCCESS updates three keys instead of just action status
  const createActionsList = [
    { actionType: CREATE, actionString: 'CREATE' },
    { actionType: CREATE_ERROR, actionString: 'CREATE_ERROR' }
  ]
  createActionsList.forEach(({ actionType, actionString }) => {
    describe(actionString, () => {
      it('updates actionStatus', () => {
        const expectedActionStatus = { some: 'actionStatus data' }
        const actionStatusReducer = expect.createSpy().andReturn(expectedActionStatus)
        const action = { type: actionType, meta: { model: 'widgets' } }

        const newState = crudReducer(initialState, action, { actionStatusReducer })

        expect(newState.widgets.actionStatus).toEqual(expectedActionStatus)
      })
    })
  })

  describe('CREATE_SUCCESS', () => {
    it('updates actionStatus, byId, and collections', () => {
      const expectedActionStatus = { some: 'actionStatus data' }
      const expectedById = { some: 'byId data' }
      const expectedCollections = { some: 'collections data' }
      const actionStatusReducer = expect.createSpy().andReturn(expectedActionStatus)
      const byIdReducer = expect.createSpy().andReturn(expectedById)
      const collectionsReducer = expect.createSpy().andReturn(expectedCollections)
      const action = { type: CREATE_SUCCESS, meta: { model: 'widgets' } }

      const newState = crudReducer(initialState, action,
                                   { actionStatusReducer, byIdReducer, collectionsReducer })

      expect(newState.widgets.actionStatus).toEqual(expectedActionStatus)
      expect(newState.widgets.byId).toEqual(expectedById)
      expect(newState.widgets.collections).toEqual(expectedCollections)
    })
  })

  const updateActionsList = [
    { actionType: UPDATE, actionString: 'UPDATE' },
    { actionType: UPDATE_SUCCESS, actionString: 'UPDATE_SUCCESS' },
    { actionType: UPDATE_SUCCESS, actionString: 'UPDATE_ERROR' }
  ]
  updateActionsList.forEach(({ actionType, actionString }) => {
    describe(actionString, () => {
      it('updates actionStatus and byId', () => {
        const expectedActionStatus = { some: 'actionStatus data' }
        const expectedById = { some: 'byId data' }
        const actionStatusReducer = expect.createSpy().andReturn(expectedActionStatus)
        const byIdReducer = expect.createSpy().andReturn(expectedById)
        const action = { type: actionType, meta: { model: 'widgets' } }

        const newState = crudReducer(initialState, action, { actionStatusReducer, byIdReducer })

        expect(newState.widgets.actionStatus).toEqual(expectedActionStatus)
        expect(newState.widgets.byId).toEqual(expectedById)
      })
    })
  })

  const deleteActionsList = [
    { actionType: DELETE, actionString: 'DELETE' },
    { actionType: DELETE_SUCCESS, actionString: 'DELETE_SUCCESS' },
    { actionType: DELETE_SUCCESS, actionString: 'DELETE_ERROR' }
  ]
  deleteActionsList.forEach(({ actionType, actionString }) => {
    describe(actionString, () => {
      it('updates actionStatus, byId, and collections', () => {
        const expectedActionStatus = { some: 'actionStatus data' }
        const expectedById = { some: 'byId data' }
        const expectedCollections = { some: 'collections data' }
        const actionStatusReducer = expect.createSpy().andReturn(expectedActionStatus)
        const byIdReducer = expect.createSpy().andReturn(expectedById)
        const collectionsReducer = expect.createSpy().andReturn(expectedCollections)
        const action = { type: actionType, meta: { model: 'widgets' } }

        const newState = crudReducer(initialState, action,
                                     { actionStatusReducer, byIdReducer, collectionsReducer })

        expect(newState.widgets.actionStatus).toEqual(expectedActionStatus)
        expect(newState.widgets.byId).toEqual(expectedById)
        expect(newState.widgets.collections).toEqual(expectedCollections)
      })
    })
  })
})
