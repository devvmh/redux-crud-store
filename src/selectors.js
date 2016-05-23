/* @flow */
/* eslint no-use-before-define: 0 */

import { fromJS, List, Map } from 'immutable'
import isEqual from 'lodash.isequal'
import {
  FETCH, FETCH_ONE, CREATE, UPDATE, DELETE
} from './actionTypes'

import type { CrudAction, ID, Model } from './actionTypes'

// TODO: `State` is not actually defined yet
import type { State } from './reducers'

export type Selection<T> = {
  otherInfo?: Object,
  data?: T,
  isLoading: boolean,
  needsFetch: boolean,
  error?: Error | { message: string },
  fetch?: CrudAction<T>,
}

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

export function select<T>(action: CrudAction<T>, crud: State): Selection<T> {
  const model = action.meta.model
  const params = action.payload.params
  let id
  let selection
  switch (action.type) {
    case FETCH:
      selection = selectCollection(model, crud, params)
      break
    case FETCH_ONE:
      id = action.meta.id
      if (id == null) {
        throw new Error('Selecting a record, but no ID was given')
      }
      selection = selectRecord(model, id, crud)
      break
    default:
      throw new Error(`Action type '${action.type}' is not a fetch action.`)
  }
  selection.fetch = action
  return selection
}

export function selectStatus<T>(action: CrudAction<T>, crud: State): NiceActionStatus<T> {
  let actionType
  switch (action.type) {
    case CREATE:
      actionType = 'create'
      break
    case UPDATE:
      actionType = 'update'
      break
    case DELETE:
      actionType = 'delete'
      break
    default:
      throw new Error(`Action type '${action.type}' is not a create, update, or delete action.`)
  }
  return selectNiceActionStatus(action.meta.model, crud, actionType)
}

export function selectCollection<T>(modelName: Model, crud: State, params: Object = {}
                                                 ): Selection<T> {
  const isLoading = ({ needsFetch }) => ({
    otherInfo: {},
    data: ([]:any),
    isLoading: true,
    needsFetch
  })

  const model = crud.getIn([modelName], Map())

  // find the collection that has the same params
  const collection = model.get('collections', List()).find(coll => (
    isEqual(coll.get('params').toJS(), params)
  ))
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
  collection.get('ids', fromJS([])).forEach((id) => {  // eslint-disable-line consistent-return
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

export function selectRecord<T>(modelName: Model, id: ID, crud: State): Selection<T> {
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

export function selectRecordOrEmptyObject<T>(modelName: Model, id: ID, crud: State): T|{} {
  const record = selectRecord(modelName, id, crud)
  if (record.isLoading || record.error) {
    return {}
  }
  return record
}

type ActionStatusSelection<T> = {
  isSuccess: ?boolean,
  pending: boolean,
  id: ?ID,
  payload: ?(T|Error)
}

export function selectActionStatus<T>(modelName: Model, crud: State,
                                      action: 'create' | 'update' | 'delete'
                                     ): ActionStatusSelection<T> {
  const status = crud.getIn([modelName, 'actionStatus', action]) ||
                 fromJS({
                   pending: false,
                   id: null,
                   isSuccess: null,
                   payload: null
                 })
  return status.toJS()
}

type NiceActionStatus<T> = {
  id?: ?ID,
  pending?: boolean,
  response?: T,
  error?: Error,
}

export function selectNiceActionStatus<T>(modelName: Model, crud: State,
                                          action: 'create' | 'update' | 'delete'
                                         ): NiceActionStatus<T> {
  const { pending, id, isSuccess, payload } = selectActionStatus(modelName, crud, action)

  if (pending === true) {
    return { id, pending }
  }
  if (isSuccess === true) {
    return {
      id,
      response: (payload:any),
      pending
    }
  }
  if (isSuccess === false) {
    return {
      id,
      error: (payload:any),
      pending
    }
  }
  return {}
}
