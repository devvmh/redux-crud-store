The API for redux-crud-store is quite varied, and leaves you a lot of options for customization. The code was originally an in-house module, so there may still be spots that need to be opened up for customization. Pull requests are welcome!

This is a copy of the contents of src/index.js:

    import crudSaga from './sagas'
    import crudReducer from './reducers'
    import * as crudActions from './actionTypes'

    export { crudSaga, crudReducer, crudActions }

    export {
      fetchCollection, fetchRecord, createRecord, updateRecord, deleteRecord,
      clearActionStatus, apiCall
    } from './actionCreators'

    export {
      selectCollection, selectRecord, selectRecordOrEmptyObject,
      selectActionStatus
    } from './selectors'

## crudSaga

crudSaga uses redux-saga to intercept actions like FETCH, CREATE, API_CALL, and others. Its use is outlined in README.md section 1. In particular, you will need to provide it with an instance of an API client class that defines:

    apiClient['get'](path, { params, data })
    apiClient['post'](path, { params, data })
    apiClient['put'](path, { params, data })
    apiClient['del'](path, { params, data })

If you end up customizing the method on any of your action creators, your apiClient will also need to implement these methods.

An example ApiClient class is outlined in README.md section 1.

## crudReducer

The crudReducer is self-contained. It is definitely worth reading through the code along with redux DevTools to see how the state is laid out, that is, quite differently than the result that will be passed to your components by the selectors.

API-wise, the only decision you have to make is the key you pass to combineReducers. In this repository's documentation, "models" is used as the key, but you can use any key, as long as you pass state["your key"] to the selector functions from your components.

    import { combineReducers } from 'redux'
    import { crudReducer } from 'redux-crud-store'
    
    export default combineReducers({
      models: crudReducer,
      // other reducers go here
    })

## crudActions

See src/crudActions.js for a full list of action types defined by this module.

## Action Creators

Example usage is outlined in README.md. If you are interested in advanced usage, see the API for apiCall at the bottom of this document.

#### fetchCollection(model : string, path : string, params : object, opts : object)

- model (required) is the key in the store
- path (required) is the path that will be passed to your API cient
- params (default {}) are the query params that will be passed to your API client
- opts (default {}) can have any of the following keys, with the stated effect:
  - 'method': overrides the method of the request from the default of 'get'

The resulting payload will be split up, with the actual data being stored in the byId section, and the ids of the data being stored along with the passed params in the collections section.

#### fetchRecord(model : string, path : string, params : object, opts : object)

- model (required) is the key in the store
- path (required) is the path that will be passed to your API cient
- params (default {}) are the query params that will be passed to your API client
- opts (default {}) can have any of the following keys, with the stated effect:
  - 'method': overrides the method of the request from the default of 'get'
    
The payload will be stored directly in the byId section of the store.

#### createRecord(model : string, path : string, params : object, data : object, opts : object)

- model (required) is the key in the store
- path (required) is the path that will be passed to your API cient
- data (default {}) is the POST data that will be passed to your API client
- params (default {}) are the query params that will be passed to your API client
- opts (default {}) can have any of the following keys, with the stated effect:
  - 'method': overrides the method of the request from the default of 'post'
    
On success, byId will be updated and all collections will be marked as needing a refresh. Additionally, actionStatus['create'] will be set.

#### updateRecord(model : string, path : string, params : object, data : object, opts : object)

- model (required) is the key in the store
- path (required) is the path that will be passed to your API cient
- data (default {}) is the PUT data that will be passed to your API client
- params (default {}) are the query params that will be passed to your API client
- opts (default {}) can have any of the following keys, with the stated effect:
  - 'method': overrides the method of the request from the default of 'put'
    
On success, byId will be updated. Additionally, actionStatus['update'] will be set.

#### deleteRecord(model : string, path : string, params : object, opts : object)

- model (required) is the key in the store
- path (required) is the path that will be passed to your API cient
- params (default {}) are the query params that will be passed to your API client
- opts (default {}) can have any of the following keys, with the stated effect:
  - 'method': overrides the method of the request from the default of 'del'
    
On success, byId will be updated and all collections will be marked as needing a refresh. Additionally, actionStatus['delete'] will be set.

#### clearActionStatus(model : string, action : string)

- model (required) is the key in the store
- action (required) must be one of 'create', 'update', or 'delete'.

This function clears the actionStatus[action] key in the store, so your components can stop rendering the success/error message.

## Selectors

TODO

## API_CALL and apiCall - roll your own!

apiCall is a really versatile function. If you find you are having troubles making it do what you want, you may want to implement your own saga/reducer/actionCreator/selectors module that copies most of the code of redux-crud-store, but for your specific purpose.

However, for some quick and dirty uses, apiCall may be helpful. Generally you'll want to write an action creator in terms of this function. Unfortunately, the dispatching action is limited to being crudActions.API_CALL, so you'll need to watch for that action in your reducer if you want to update the store when the api call is dispatched.

We used to use this function to send autocomplete queries from an autocomplete input box, but eventually were forced to re-implement the whole stack. This was so we could use the `takeLatest` method from redux-saga instead of `takeEvery`. In the future we may be able to implement a TAKE_LATEST_API_CALL action. Pull requests welcome!

#### apiCall(success : string, failure : string, method : string, path : string, params : object, data: object, opts : object)

- success (required) is the action type to be dispatched on success
- failure (required) is the action type to be dispatched if the request returns any kind of error (including Javascript errors)
- method (required) is the string, like 'get' or 'post', that will be passed to your ApiClient
- path (required) is the path that will be passd to your ApiClient
- params (default {}) are the query params that will be passed to your API client
- data (default undefined) is the data that will be passed along with POST or PUT requests
- opts (default {}) can have any of the following keys, with the stated effect:
  - 'meta': Can contain any properties except 'success' or 'failure', and will be passed to the success or failure actions in the action.meta key.
