/* Imports */
require("isomorphic-fetch")
const { crudSaga, crudReducer, fetchCollection, selectCollection, ApiClient } = require("redux-crud-store")
const { createStore, compose, applyMiddleware } = require("redux")
const createSagaMiddleware = require("redux-saga").default

/* Local variables */
const params = { page: 1, per_page: 10, state: 'closed' }
const fetchAction = fetchCollection('issues', '/repos/devvmh/redux-crud-store/issues', params)
const client = new ApiClient({ basePath: 'https://api.github.com' })

/* Set up store and integrate redux-crud-store as the top level reducer */
const crudMiddleware = createSagaMiddleware()
const createStoreWithMiddleware = compose(
  applyMiddleware(
    crudMiddleware
  )
)(createStore)
let store = createStoreWithMiddleware(crudReducer)
crudMiddleware.run(crudSaga(client))

/* Demo */
const log = []
store.subscribe(() => {
  if (log.length === 0) {
    log.push("selectCollection after first FETCH:")
    log.push(selectCollection('issues', store.getState(), params))
    log.push("state after first FETCH:")
    log.push(store.getState())
  } else if (log.length === 4) {
    log.push("selectCollection after FETCH_SUCCESS/FETCH_ERROR:")
    log.push(selectCollection('issues', store.getState(), params))
    log.push("state after FETCH_SUCCESS/FETCH_ERROR:")
    log.push(store.getState())
    console.log(log)
  }
})

store.dispatch(fetchAction) // FETCH
"You can use the result of selectCollection in your components"
