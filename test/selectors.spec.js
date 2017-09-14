import expect from 'expect'

import {
  fetchCollection, fetchRecord, createRecord, updateRecord, deleteRecord
} from '../src/actionCreators'

import {
  select, selectCollection, selectRecord,
  selectRecordOrEmptyObject
} from '../src/selectors'

const now = Date.now()
const yesterday = now - 24 * 60 * 60 * 1000

const modelName = 'widgets'
const crud = {
  widgets: {
    collections: [
      {
        params: {
          page: 1
        },
        otherInfo: {
          count: 3,
          page: {
            self: 1,
            next: 0,
            prev: 0,
            total: 1
          }
        },
        ids: [1, 2, 3],
        fetchTime: now,
        error: null
      }
    ],
    byId: {
      1: { fetchTime: now, error: null, record: { id: 1, name: 'one' } },
      2: { fetchTime: now, error: null, record: { id: 2, name: 'two' } },
      3: { fetchTime: now, error: null, record: { id: 3, name: 'three' } }
    }
  },
  actionStatus: {
    create: {},
    update: {},
    delete: {}
  }
}

const expectedOutput = {
  otherInfo: {
    count: 3,
    page: {
      self: 1,
      next: 0,
      prev: 0,
      total: 1
    }
  },
  data: [
    { id: 1, name: 'one' },
    { id: 2, name: 'two' },
    { id: 3, name: 'three' }
  ],
  isLoading: false,
  needsFetch: false,
  error: null
}

const isLoadingOutput = {
  otherInfo: {},
  data: [],
  isLoading: true,
  needsFetch: true
}

/* action creators */
function fetchWidgets(page) {
  return fetchCollection(modelName, '/widgets', { page })
}
function fetchWidget(id) {
  return fetchRecord(modelName, id, `/widgets/${id}`)
}
function createWidget(w) {
  return createRecord(modelName, '/widgets', w)
}
function updateWidget(id, w) {
  return updateRecord(modelName, id, `/widgets/${id}`, w)
}
function deleteWidget(id) {
  return deleteRecord(modelName, id, `/widgets/${id}`)
}

/* helpers */
function setIn(subject, path, value) {
  if (Array.isArray(subject)) {
    // eslint-disable-next-line no-use-before-define
    return setInArray(subject, path, value)
  }

  // eslint-disable-next-line no-use-before-define
  return setInObject(subject, path, value)
}

function setInArray(arr, path, value) {
  if (Array.isArray(path) && path.length > 1) {
    const index = path[0]
    return arr.slice(0, index)
      .concat([setIn(arr[index], path.slice(1), value)])
      .concat(arr.slice(index + 1))
  }

  const index = Array.isArray(path) ? path[0] : path
  return arr.slice(0, index)
    .concat(value)
    .concat(arr.slice(index + 1))
}

function setInObject(object, path, value) {
  if (Array.isArray(path) && path.length > 1) {
    return Object.assign({}, object, {
      [path[0]]: setIn(object[path[0]], path.slice(1), value)
    })
  }
  if (Array.isArray(path) && path.length === 1) {
    return Object.assign({}, object, {
      [path[0]]: value
    })
  }

  return Object.assign({}, object, {
    [path]: value
  })
}

function deleteIn(object = {}, path) {
  if (Array.isArray(path) && path.length > 1) {
    return Object.assign({}, object, {
      [path[0]]: deleteIn(object[path[0]], path.slice(1))
    })
  }
  if (Array.isArray(path) && path.length === 1) {
    const newObject = Object.assign({}, object)
    delete newObject[path[0]]
    return newObject
  }
  const newObject = Object.assign({}, object)
  delete newObject[path]
  return newObject
}

describe('select', () => {
  it('selects collections', () => {
    const selection = select(fetchWidgets(1), crud)
    delete selection.fetch
    expect(selection).toEqual(
      selectCollection(modelName, crud, { page: 1 })
    )
  })
  it('selects records', () => {
    const selection = select(fetchWidget(3), crud)
    delete selection.fetch
    expect(selection.data).toEqual(
      selectRecord(modelName, 3, crud)
    )
  })
  it('provides selection data when selecting a collection', () => {
    const selection = select(fetchWidgets(1), crud)
    expect(selection.needsFetch).toBe(false)
    expect(selection.data).toEqual(
      expectedOutput.data
    )
  })
  it('provides selection data when selecting a record', () => {
    const selection = select(fetchWidget(3), crud)
    expect(selection.needsFetch).toBe(false)
    expect(selection.data).toEqual(
      expectedOutput.data[2]
    )
  })
  it('exposes underlying action', () => {
    const action = fetchWidgets(1)
    const selection = select(action, crud)
    expect(selection.fetch).toEqual(action)
  })
})

describe('selectCollection', () => {
  describe('store has valid, up-to-date models', () => {
    it('should return the correct models for rendering', () => {
      expect(selectCollection(modelName, crud, { page: 1 })).toEqual(expectedOutput)
    })
  })
  describe('has an error', () => {
    it('sets error', () => {
      const loadFailed = new Error('500 Interval Server Error')
      const fetchError = selectCollection(
        modelName,
        setIn(crud, [modelName, 'collections', 0, 'error'], loadFailed),
        { page: 1 }
      )
      expect(fetchError.error).toEqual(loadFailed)
    })
  })
  describe('fetchTime is yesterday', () => {
    it('sets isLoading and needsFetch to true', () => {
      const fetchTimeYesterday = selectCollection(
        modelName,
        setIn(crud, [modelName, 'collections', 0, 'fetchTime'], yesterday),
        { page: 1 }
      )
      expect(fetchTimeYesterday.isLoading).toEqual(true)
      expect(fetchTimeYesterday.needsFetch).toEqual(true)
    })
  })
  describe('fetch time is 0 (i.e. already loading)', () => {
    it('sets isLoading to true and needsFetch to false', () => {
      const fetchTimeZero = selectCollection(
        modelName,
        setIn(crud, [modelName, 'collections', 0, 'fetchTime'], 0),
        { page: 1 }
      )
      expect(fetchTimeZero.isLoading).toEqual(true)
      expect(fetchTimeZero.needsFetch).toEqual(false)
    })
  })
})

describe('selectCollection with page:', () => {
  describe('page requested is not in store', () => {
    it('should return isLoading: true', () => {
      expect(selectCollection(modelName, crud, { page: 2 })).toEqual(isLoadingOutput)
    })
  })
})

describe('selectRecord', () => {
  describe('model exists in store', () => {
    describe('model is recent', () => {
      it('returns the model', () => {
        expect(selectRecord(modelName, 1, crud)).toEqual({ id: 1, name: 'one' })
      })
    })

    describe('model has an error', () => {
      const loadFailed = new Error('500 Interval Server Error')
      const errorModels = setIn(crud, [modelName, 'byId', '1', 'error'], loadFailed)
      it('renders the error', () => {
        expect(selectRecord(modelName, 1, errorModels)).toEqual({
          isLoading: false,
          needsFetch: false,
          error: loadFailed
        })
      })
    })
    describe('model is out of date', () => {
      const oldModels = setIn(crud, [modelName, 'byId', '1', 'fetchTime'], yesterday)
      it('returns "needs fetch"', () => {
        const get = selectRecord(modelName, 1, oldModels)
        expect(get.isLoading).toEqual(true)
        expect(get.needsFetch).toEqual(true)
        expect(get.error.message).toEqual('Loading...')
      })
    })
  })
  describe('model does not exist in store', () => {
    const missingModels = deleteIn(crud, [modelName, 'byId', '1'])
    it('returns "needs fetch"', () => {
      const get = selectRecord(modelName, 1, missingModels)
      expect(get.isLoading).toEqual(true)
      expect(get.needsFetch).toEqual(true)
      expect(get.error.message).toEqual('Loading...')
    })
  })
  describe('fetchTime is 0', () => {
    const loadingModels = setIn(crud, [modelName, 'byId', '1', 'fetchTime'], 0)
    it('returns "loading"', () => {
      const get = selectRecord(modelName, 1, loadingModels)
      expect(get.isLoading).toEqual(true)
      expect(get.needsFetch).toEqual(false)
      expect(get.error.message).toEqual('Loading...')
    })
  })
})

describe('selectRecordOrEmptyObject', () => {
  it('returns valid object from selectRecord', () => {
    expect(selectRecordOrEmptyObject(modelName, 1, crud)).toEqual(selectRecord(modelName, 1, crud))
  })
  it('empty object if model has an error', () => {
    const loadFailed = new Error('500 Interval Server Error')
    const errorModels = setIn(crud, [modelName, 'byId', '1', 'error'], loadFailed)
    expect(selectRecordOrEmptyObject(modelName, 1, errorModels)).toEqual({})
  })
  it('empty object if model is loading', () => {
    const oldModels = setIn(crud, [modelName, 'byId', '1', 'fetchTime'], yesterday)
    expect(selectRecordOrEmptyObject(modelName, 1, oldModels)).toEqual({})
  })
})
