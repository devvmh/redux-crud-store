import { fromJS, List, Map } from 'immutable'

const recentTimeInterval = 10 * 60 * 1000 // ten minutes

/*
 * Returns false if:
 *  - fetchTime is more than 10 minutes ago
 *  - fetchTime is null (hasn't been set yet)
 *  - fetchTime is 0 (but note, this won't return NEEDS_FETCH)
 */
function recent(fetchTime) {
  if (fetchTime === null) return false

  return Date.now() - recentTimeInterval < fetchTime
}

// thanks http://stackoverflow.com/a/16788517/5332286
function objectEquals(x, y) {
  if (x === null || x === undefined) {
    return x === y
  }
  if (x.constructor !== y.constructor) { return false }
  if (x instanceof Function) { return x === y }
  if (x instanceof RegExp) { return x === y }
  if (x === y || x.valueOf() === y.valueOf()) { return true }
  if (Array.isArray(x) && x.length !== y.length) { return false }
  if (x instanceof Date) { return false }
  if (!(x instanceof Object)) { return false }
  if (!(y instanceof Object)) { return false }
  const p = Object.keys(x)
  return Object.keys(y).every(i => p.indexOf(i) !== -1) &&
         p.every(i => objectEquals(x[i], y[i]))
}

export function selectCollection(modelName, crud, params = {}) {
  const isLoading = ({ needsFetch }) => ({
    otherInfo: {},
    data: [],
    isLoading: true,
    needsFetch
  })

  const model = crud.getIn([modelName], Map())

  // find the collection that has the same params
  const collection = model.get('collections', List()).find(coll => {
    return objectEquals(coll.get('params').toJS(), params)
  })
  if (collection === undefined) {
    return isLoading({ needsFetch: true })
  }

  const fetchTime = collection.get('fetchTime')
  if (fetchTime === 0) {
    return isLoading({ needsFetch: false })
  } else if (!recent(fetchTime)) {
    return isLoading({ needsFetch: true })
  }

  // search the records to ensure they're all recent
  // TODO can we make this faster?
  let itemNeedsFetch = null
  collection.get('ids', fromJS([])).forEach((id) => {
    const item = model.getIn(['byId', id.toString()], Map())
    if (!recent(item.get('fetchTime'))) {
      itemNeedsFetch = item
      return false
    }
  })
  if (itemNeedsFetch) {
    if (itemNeedsFetch.get('fetchTime') === 0) {
      return isLoading({ needsFetch: false })
    }
    return isLoading({ needsFetch: true })
  }

  const data = collection.get('ids', fromJS([])).map((id) =>
    model.getIn(['byId', id.toString(), 'record'])
  ).toJS()

  return {
    otherInfo: collection.get('otherInfo', Map()).toJS(),
    data,
    isLoading: false,
    needsFetch: false
  }
}

export function selectRecord(modelName, id, crud) {
  const id_str = id ? id.toString() : undefined
  const model = crud.getIn([modelName, 'byId', id_str])

  if (model && model.get('fetchTime') === 0) {
    return { isLoading: true, needsFetch: false, error: { message: 'Loading...' } }
  }
  if (id === undefined || model === undefined ||
      !recent(model.get('fetchTime'))) {
    return { isLoading: true, needsFetch: true, error: { message: 'Loading...' } }
  }

  if (model.get('error') !== null) {
    return {
      isLoading: false,
      needsFetch: false,
      error: model.get('error').toJS()
    }
  }
  return model.get('record').toJS()
}

export function selectRecordOrEmptyObject(modelName, id, crud) {
  const record = selectRecord(modelName, id, crud)
  if (record.isLoading || record.error) {
    return {}
  }
  return record
}

export function selectActionStatus(modelName, crud, action) {
  const status = crud.getIn([modelName, 'actionStatus', action]) ||
                 fromJS({
                   pending: false,
                   id: null,
                   isSuccess: null,
                   payload: null
                 })
  return status.toJS()
}

export function selectNiceActionStatus(modelName, crud, action) {
  const { pending, id, isSuccess, payload } = selectActionStatus(modelName, crud, action)

  if (pending === true) {
    return { id }
  }
  if (isSuccess === true) {
    return {
      id,
      response: payload
    }
  }
  if (isSuccess === false) {
    return {
      id,
      error: payload
    }
  }
  return {}
}
