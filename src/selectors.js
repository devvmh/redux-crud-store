/* @flow */
/* global T */
/* eslint no-use-before-define: 0 */

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
  error?: Error,
  fetch?: CrudAction<T>,
}

export type SelectorOpts = {
  interval?: number
}

/*
 * Returns false if:
 *  - fetchTime is more than 10 minutes ago
 *  - fetchTime is null (hasn't been set yet)
 *  - fetchTime is 0 (but note, this won't return NEEDS_FETCH)
 */
function recent(fetchTime, opts: SelectorOpts = {}) {
  if (fetchTime === null) return false

  const interval = opts.interval || 10 * 60 * 1000 // ten minutes

  return Date.now() - interval < fetchTime
}

export function select<T>(action: CrudAction<T>, crud: State, opts: SelectorOpts = {}
                         ): Selection<T> {
  const model = action.meta.model
  const params = action.payload.params
  let id
  let selection
  switch (action.type) {
    case FETCH:
      selection = selectCollection(model, crud, params, opts)
      break
    case FETCH_ONE:
      id = action.meta.id
      if (id == null) {
        throw new Error('Selecting a record, but no ID was given')
      }
      selection = getRecordSelection(model, id, crud, opts)
      break
    default:
      throw new Error(`Action type '${action.type}' is not a fetch action.`)
  }
  selection.fetch = action
  return selection
}

export function selectCollection<T>(modelName: Model, crud: State, params: Object = {},
                                    opts: SelectorOpts = {}): Selection<T> {
  const model = crud[modelName] || {}
  const collection = (model.collections || []).find(coll => (
    isEqual(coll.params, params)
  ))

  const isLoading = ({ needsFetch }) => ({
    otherInfo: {},
    data: ([]:any),
    isLoading: true,
    ...(collection ? { error: collection.error } : {}),
    needsFetch
  })

  // find the collection that has the same params
  if (collection === undefined) {
    return isLoading({ needsFetch: true })
  }

  const fetchTime = collection.get('fetchTime')
  if (fetchTime === 0) {
    return isLoading({ needsFetch: false })
  } else if (!recent(fetchTime, opts)) {
    return isLoading({ needsFetch: true })
  }

  // search the records to ensure they're all recent
  // TODO can we make this faster?
  let itemThatNeedsFetch = null
  ;(collection.ids || []).forEach((id) => {  // eslint-disable-line consistent-return
    const item = model.byId && model.byId[id] || {}
    const itemFetchTime = item.fetchTime
    // if fetchTime on the record is 0, don't set the whole collection to isLoading
    if (itemFetchTime !== 0 && !recent(item.fetchTime, opts)) {
      itemThatNeedsFetch = item
      return false
    }
  })
  if (itemThatNeedsFetch) {
    return isLoading({ needsFetch: true })
  }

  const data = (collection.ids || []).map(id =>
    model.byId && model.byId[id] && model.byId[id].record
  )

  return {
    otherInfo: collection.otherInfo || {},
    data,
    isLoading: false,
    needsFetch: false,
    ...(collection ? { error: collection.error } : {})
  }
}

function getRecordSelection<T>(modelName: Model, id: ID, crud: State, opts: SelectorOpts = {}
                              ): Selection<T> {
  const id_str = id ? id.toString() : undefined
  const model = crud.getIn([modelName, 'byId', id_str])

  if (model && model.fetchTime === 0) {
    return { isLoading: true, needsFetch: false, error: new Error('Loading...') }
  }
  if (id === undefined || model === undefined || !recent(model.fetchTime, opts)) {
    return { isLoading: true, needsFetch: true, error: new Error('Loading...') }
  }

  if (model.error !== null) {
    return {
      isLoading: false,
      needsFetch: false,
      error: model.error
    }
  }
  return {
    isLoading: false,
    needsFetch: false,
    data: model.record
  }
}

export function selectRecord<T>(modelName: Model, id: ID, crud: State, opts: SelectorOpts = {}
                               ): T | Selection<T> {
  const sel = getRecordSelection(modelName, id, crud, opts)
  if (sel.data) {
    return sel.data
  }
  return sel
}

export function selectRecordOrEmptyObject<T>(modelName: Model, id: ID, crud: State,
                                             opts: SelectorOpts = {}): T|{} {
  const record = selectRecord(modelName, id, crud, opts)
  if (record.isLoading || record.error) {
    return {}
  }
  return record
}

type ActionStatusSelection<T> = {
  id: ?ID,
  pending: boolean,
  response?: T,
  error?: Error,
}

export function selectActionStatus<T>(modelName: Model, crud: State,
                                      action: 'create' | 'update' | 'delete'
                                     ): ActionStatusSelection<T> {
  const rawStatus = crud[modelName]
                    && crud[modelName].actionStatus
                    && crud[modelName].actionStatus[action]
                    || {}
  const { pending = false, id = null, isSuccess = null, payload = null } = rawStatus

  if (pending === true) {
    return { id, pending }
  }
  if (isSuccess === true) {
    return {
      id,
      pending,
      response: (payload:any)
    }
  }
  return {
    id,
    pending,
    error: (payload:any)
  }
}
