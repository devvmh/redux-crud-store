import expect from 'expect'

import {
  fetchCollection, fetchRecord, createRecord, updateRecord, deleteRecord,
  clearActionStatus, clearModelData, apiCall
} from '../src/actionCreators'

import {
    FETCH, FETCH_SUCCESS, FETCH_ERROR,
    FETCH_ONE, FETCH_ONE_SUCCESS, FETCH_ONE_ERROR,
    CREATE, CREATE_SUCCESS, CREATE_ERROR,
    UPDATE, UPDATE_SUCCESS, UPDATE_ERROR,
    DELETE, DELETE_SUCCESS, DELETE_ERROR,
    CLEAR_ACTION_STATUS, API_CALL, CLEAR_MODEL_DATA
} from '../src/actionTypes'

describe('fetchCollection', () => {
  const MODEL = 'posts'
  const PATH = '/posts'
  const params = { isParams: true }
  const opts = { fetchConfig: { isFetchConfig: true }, method: { isMethod: true } }
  const action = fetchCollection(MODEL, PATH, params, opts)

  it('has type FETCH', () => {
    expect(action.type).toEqual(FETCH)
  })
  it('specifies correct success/failure actions in meta', () => {
    expect(action.meta.success).toEqual(FETCH_SUCCESS)
    expect(action.meta.failure).toEqual(FETCH_ERROR)
  })
  it('puts params in meta and payload', () => {
    expect(action.meta.params).toEqual(params)
    expect(action.payload.params).toEqual(params)
  })
  it('puts model in meta', () => {
    expect(action.meta.model).toEqual(MODEL)
  })
  it('puts fetchConfig in payload', () => {
    expect(action.payload.fetchConfig).toEqual(opts.fetchConfig)
  })
  it('puts method in payload', () => {
    expect(action.payload.method).toEqual(opts.method)
  })
  it('puts path in payload', () => {
    expect(action.payload.path).toEqual(PATH)
  })
  it("doesn't have other keys", () => {
    expect(Object.keys(action)).toEqual(['type', 'meta', 'payload'])
  })
})

describe('fetchRecord', () => {
  const MODEL = 'posts'
  const id = 1
  const PATH = '/posts'
  const params = { isParams: true }
  const opts = { fetchConfig: { isFetchConfig: true }, method: { isMethod: true } }
  const action = fetchRecord(MODEL, id, PATH, params, opts)

  it('has type FETCH_ONE', () => {
    expect(action.type).toEqual(FETCH_ONE)
  })
  it('specifies correct success/failure actions in meta', () => {
    expect(action.meta.success).toEqual(FETCH_ONE_SUCCESS)
    expect(action.meta.failure).toEqual(FETCH_ONE_ERROR)
  })
  it('puts model in meta', () => {
    expect(action.meta.model).toEqual(MODEL)
  })
  it('puts id in meta', () => {
    expect(action.meta.id).toEqual(id)
  })
  it('puts fetchConfig in payload', () => {
    expect(action.payload.fetchConfig).toEqual(opts.fetchConfig)
  })
  it('puts method in payload', () => {
    expect(action.payload.method).toEqual(opts.method)
  })
  it('puts path in payload', () => {
    expect(action.payload.path).toEqual(PATH)
  })
  it('puts params in payload', () => {
    expect(action.payload.params).toEqual(params)
  })
  it("doesn't have other keys", () => {
    expect(Object.keys(action)).toEqual(['type', 'meta', 'payload'])
  })
})

describe('createRecord', () => {
  const MODEL = 'posts'
  const PATH = '/posts'
  const params = { isParams: true }
  const data = { isData: true }
  const opts = { fetchConfig: { isFetchConfig: true }, method: { isMethod: true } }
  const action = createRecord(MODEL, PATH, data, params, opts)

  it('has type CREATE', () => {
    expect(action.type).toEqual(CREATE)
  })
  it('specifies correct success/failure actions in meta', () => {
    expect(action.meta.success).toEqual(CREATE_SUCCESS)
    expect(action.meta.failure).toEqual(CREATE_ERROR)
  })
  it('puts model in meta', () => {
    expect(action.meta.model).toEqual(MODEL)
  })
  it('puts fetchConfig in payload', () => {
    expect(action.payload.fetchConfig).toEqual(opts.fetchConfig)
  })
  it('puts method in payload', () => {
    expect(action.payload.method).toEqual(opts.method)
  })
  it('puts path in payload', () => {
    expect(action.payload.path).toEqual(PATH)
  })
  it('puts data in payload', () => {
    expect(action.payload.data).toEqual(data)
  })
  it('puts params in payload', () => {
    expect(action.payload.params).toEqual(params)
  })
  it("doesn't have other keys", () => {
    expect(Object.keys(action)).toEqual(['type', 'meta', 'payload'])
  })
})

describe('updateRecord', () => {
  const MODEL = 'posts'
  const id = 1
  const PATH = '/posts'
  const params = { isParams: true }
  const data = { isData: true }
  const opts = { fetchConfig: { isFetchConfig: true }, method: { isMethod: true } }
  const action = updateRecord(MODEL, id, PATH, data, params, opts)

  it('has type UPDATE', () => {
    expect(action.type).toEqual(UPDATE)
  })
  it('specifies correct success/failure actions in meta', () => {
    expect(action.meta.success).toEqual(UPDATE_SUCCESS)
    expect(action.meta.failure).toEqual(UPDATE_ERROR)
  })
  it('puts model in meta', () => {
    expect(action.meta.model).toEqual(MODEL)
  })
  it('puts id in meta', () => {
    expect(action.meta.id).toEqual(id)
  })
  it('puts fetchConfig in payload', () => {
    expect(action.payload.fetchConfig).toEqual(opts.fetchConfig)
  })
  it('puts method in payload', () => {
    expect(action.payload.method).toEqual(opts.method)
  })
  it('puts path in payload', () => {
    expect(action.payload.path).toEqual(PATH)
  })
  it('puts data in payload', () => {
    expect(action.payload.data).toEqual(data)
  })
  it('puts params in payload', () => {
    expect(action.payload.params).toEqual(params)
  })
  it("doesn't have other keys", () => {
    expect(Object.keys(action)).toEqual(['type', 'meta', 'payload'])
  })
})

describe('deleteRecord', () => {
  const MODEL = 'posts'
  const id = 1
  const PATH = '/posts'
  const params = { isParams: true }
  const opts = { fetchConfig: { isFetchConfig: true }, method: { isMethod: true } }
  const action = deleteRecord(MODEL, id, PATH, params, opts)

  it('has type DELETE', () => {
    expect(action.type).toEqual(DELETE)
  })
  it('specifies correct success/failure actions in meta', () => {
    expect(action.meta.success).toEqual(DELETE_SUCCESS)
    expect(action.meta.failure).toEqual(DELETE_ERROR)
  })
  it('puts model in meta', () => {
    expect(action.meta.model).toEqual(MODEL)
  })
  it('puts id in meta', () => {
    expect(action.meta.id).toEqual(id)
  })
  it('puts fetchConfig in payload', () => {
    expect(action.payload.fetchConfig).toEqual(opts.fetchConfig)
  })
  it('puts method in payload', () => {
    expect(action.payload.method).toEqual(opts.method)
  })
  it('puts path in payload', () => {
    expect(action.payload.path).toEqual(PATH)
  })
  it('puts params in payload', () => {
    expect(action.payload.params).toEqual(params)
  })
  it("doesn't have other keys", () => {
    expect(Object.keys(action)).toEqual(['type', 'meta', 'payload'])
  })
})

describe('clearActionStatus', () => {
  const action = clearActionStatus('posts', 'create')

  it('has type CLEAR_ACTION_STATUS', () => {
    expect(action.type).toEqual(CLEAR_ACTION_STATUS)
  })
  it('puts model in payload', () => {
    expect(action.payload.model).toEqual('posts')
  })
  it('puts action in payload', () => {
    expect(action.payload.action).toEqual('create')
  })
  it("doesn't have other keys", () => {
    expect(Object.keys(action)).toEqual(['type', 'payload'])
  })
})

describe('clearModelData', () => {
  const action = clearModelData('posts')

  it('has type CLEAR_MODEL_DATA', () => {
    expect(action.type).toEqual(CLEAR_MODEL_DATA)
  })
  it('puts model in payload', () => {
    expect(action.payload.model).toEqual('posts')
  })
  it("doesn't have other keys", () => {
    expect(Object.keys(action)).toEqual(['type', 'payload'])
  })
})

describe('apiCall', () => {
  const success = 'SOME_SUCCESS_ACTION'
  const failure = 'SOME_ERROR_ACTION'
  const method = 'patch'
  const PATH = '/special-endpoint'
  const params = { isParams: true }
  const data = { isData: true }
  const opts = { fetchConfig: { isFetchConfig: true }, meta: { isMeta: true } }
  const action = apiCall(success, failure, method, PATH, params, data, opts)

  it('has type API_CALL', () => {
    expect(action.type).toEqual(API_CALL)
  })
  it('puts success/failure actions in meta', () => {
    expect(action.meta.success).toEqual(success)
    expect(action.meta.failure).toEqual(failure)
  })
  it('includes other keys specified in opts.meta in meta', () => {
    expect(action.meta.isMeta).toEqual(true)
    expect(Object.keys(action.meta)).toEqual(['isMeta', 'success', 'failure'])
  })
  it('puts fetchConfig in payload', () => {
    expect(action.payload.fetchConfig).toEqual(opts.fetchConfig)
  })
  it('puts method in payload', () => {
    expect(action.payload.method).toEqual(method)
  })
  it('puts path in payload', () => {
    expect(action.payload.path).toEqual(PATH)
  })
  it('puts params in payload', () => {
    expect(action.payload.params).toEqual(params)
  })
  it('puts data in payload', () => {
    expect(action.payload.data).toEqual(data)
  })
  it("doesn't have other keys", () => {
    expect(Object.keys(action)).toEqual(['type', 'meta', 'payload'])
  })
})
