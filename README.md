# redux-crud-store - a reusable API for syncing models with a backend

This module contains a number of helper functions to make keeping a Redux store for a single page application in sync with a backend. In particular, it provides these four things:

2. A redux-saga saga that you can add to your middlewares to send the async calls for CRUD actions, and also to dispatch the success/error actions when the call is complete.
1. A reducer that handles the async send, async success, and async failure actions, and stores the results in an intelligent way in your redux store.
3. Constants and action creators for each action type.
4. Selector functions, which return a collection of models, a single model, or an object saying "wait for me to load" or "you need to dispatch another fetch action"

Additionally, the module caches collections and records. So if you send a request like `GET /posts` to your server with the params

    {
      page: 2,
      per: 25,
      filter: {
        author_id: 20
      }
    }

it will store the ids associated with that collection in the store. If you make the same request again in the next 10 minutes, it will simply use the cached result instead.

Further, if you then want to inspect or edit one of the 25 posts returned by that query, it will already be stored in the byId array in the store. Collections simply hold a list of ids.

If you ever worry about your cache getting out of sync, it's easy to manually sync to the server from your components.

## How to use it

There are four ways to integrate redux-crud-store into your app:

1. Set up a redux-saga middleware
2. Add the reducer to your store
3. Create action creators for your specific models
4. Use redux-crud-store's selectors and your action creators in your components

### 1. Set up a redux-saga middleware

You'll need to write an ApiClient that looks something like this, and can handle 'get', 'post', 'put', and 'del' methods:

    import superagent from 'superagent'
    const base_path = 'https://example.com/api/v3'
    class _ApiClient {
      constructor(req) {
        methods.forEach((method) =>
          this[method] = (path, { params, data } = {}) => new Promise((resolve, reject) => {
            const request = superagent[method](base_path + path)

            if (params) {
              request.query(params)
            }

            if (data) {
              request.send(data)
            }

            request.withCredentials().end((err, { body } = {}) => err ? reject(body || err) : resolve(body))
          }))
      }
    }

You don't need to use this exact code, but you must match the API. See src/sagas.js for how this client is called.

Once you've done that, you can create a redux-saga middleware and add it to your store:

    import { createStore, applyMiddleware, compose } from 'redux'
    import { crudSaga } from 'redux-crud-store'
    import createSagaMiddleware from 'redux-saga'
    import { ApiClient } from './util/ApiClient' // write this yourself!

    const client = new ApiClient()
    const crudMiddleware = createSagaMiddleware(crudSaga(client) 

    const createStoreWithMiddleware = compose(
      applyMiddleware(
        crudMiddleware
        // add other middlewares here...
      )
    )(createStore)

    // then use createStoreWithMiddleware as you like

### 2. Add the reducer to your store

This step is a bit easier! If you like composing your reducers in one file, here's what that file might look like:

    import { combineReducers } from 'redux'
    import { crudReducer } from 'redux-crud-store'

    export default combineReducers({
      models: crudReducer,
      // other reducers go here
    })

### 3. Create action creators for your specific models

A given model might use very predictable endpoints, or it might need a lot of logic. You can make your action creators very quickly by basing them off of redux-crud-store's API:

    import {
      fetchCollection, fetchRecord, createRecord, updateRecord, deleteRecord
    } from 'redux-crud-store'

    const MODEL = 'posts'
    const PATH = '/posts'

    export function fetchPosts(params = {}) {
      return fetchCollection(MODEL, PATH, params)
    }

    export function fetchPost(id, params = {}) {
      return fetchRecord(MODEL, id, `${PATH}/${id}`, params)
    }

    export function createPost(data = {}) {
      return createRecord(MODEL, PATH, data)
    }

    export function updatePost(id, data = {}) {
      return updateRecord(MODEL, id, `${PATH}/${id}`, data)
    }

    export function deletePost(id) {
      return deleteRecord(MODEL, id, `${PATH}/${id}`)
    }

redux-crud-store is based on a RESTful API. If you need support for non-restful endpoints, take a look at the apiCall function in src/actionCreators.js and/or submit a pull request!

### 4. Use redux-crud-store's selectors and your action creators in your components

A typical component to render page 1 of a collection might look like this:

    import React from 'react'
    import { mapStoteToProps, mapDispatchToProps, connect } from 'react-redux'

    import { fetchPosts } from '../../redux/modules/posts'
    import { selectCollection } from 'redux-crud-store'

    class List extends React.Component {
      componentWillMount() {
        if (this.props.posts.needsFetch) {
          this.props.actions.fetchPosts({ page: 1 })
        }
      }

      componentWillReceiveProps(nextProps) {
        if (nextProps.posts.needsFetch) {
          this.props.actions.fetchPosts({ page: 1 })
        }
      }

      render() {...}
    }

    function mapStateToProps(state, ownProps) {
      return { posts: selectCollection('posts', state.models, { page: 1 }) }


    function mapDispatchToProps(dispatch) {
      return { actions: bindActionCreators(Object.assign({}, { fetchPosts }), dispatch) }
    }

    export default connect(mapStateToProps, mapDispatchToProps)(List)

Fetching a single record is very similar. A typical component for editing a single record might implement these functions:

    componentWillMount() {
      if (this.props.post.needsFetch) this.props.actions.fetchPost(this.props.id)
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.post.needsFetch) nextProps.actions.fetchPost(nextProps.id)
      if (nextProps.status.isSuccess) {
        this.props.actions.clearActionStatus('post', 'update')
      }
    }

    disableSubmitButton = () => {
      // this function would return true if you suold disable the submit
      // button on your form - because you've already sent a PUT request
      return !!nextProps.status.pending
    }

    ....

    function mapStateToProps(state, ownProps) {
      return {
        post: selectRecord('posts', ownProps.id, state.models) },
        status: selectActionStatus('posts', state.models, 'update')
      }
    }

## What's still missing

 - it would be great to have a garbage collector using redux-saga
 - default fetch client could be included, to make saga setup easier
 - expand support for the generic API_CALL action
 - allow dispatching multiple actions for API_CALL
 - consider allowing dispatching multiple actions for CREATE/UPDATE/DELETE
 - it would be great to support nested models - automatically stripping the models out of a parent object, moving them into their own store, and storing the parent with just an id reference. This might make component logic kind of intense if we aren't careful.
 - allow other methods and customizations through object parameters on the default functions

## The original documentation

What follows is our original notes on the functioning of this module. Someday we'll clean this up. Pull requests are welcome!

### Brief layout of what state.models should look like

    // note: uses Immutable.js in reality
    state.models : {
      posts: {
        collections: [
          {
            params: {
              no_pagination: true
            },
            other_info: null,
            ids: [ 15000, 15001, ... ],
            fetchTime: 1325355325,
            error: null
          },
          {
            params: {
              page: 1
            },
            other_info: {
              self: 1,
              next: 2,
              prev: 0,
              ...
            },
            ids: [ 15000, 15001, ... ],
            fetchTime: 1325355325,
            error: { status: 500, message: '500 Internal Server error' }
          },
        ],
        byId: {
          15000: { fetchTime: 1325355325,
                   error: { type: 403, message: '403 Forbidden' },
                   record: { id: 15000, ... } },
          15001: { fetchTime: 1325355325,
                   error: null,
                   record: { id: 15001, ... } }
        },
        actionStatus: {
          create: { pending: false, isSuccess: true, errors: null },
          update: { pending: false, isSuccess: false, message: "Invalid id", errors: { "planner_id": "not a planner" } },
          delete: { pending: true }
        }
      },
      comments: {
        // the exact same layout as post...
      },
    }

### Fetch Time

 - state.models.plans.collections[n].fetchTime is used for refreshing current page if desired
 - state.models.plans.byId.15000.fetchTime is used for refreshing current record if desired
 - getting a collection and then a record: getting the record should be intantaneous.
 - fetching 25 records and then the corresponding collection, sadly, is not.
 - fetchTime === 0 indicates loading
 - fetchTime === null indicates it needs to be loaded, but isn't currently.
 - fetchTime > 10 minutes ago leads to a re-fetch

### selector function design

#### these functions are DUMB - they can't dispatch actions
- selectCollection: loads results for a certain set of params - store in byId array
  first call returns an error object
  call again on FETCHED and it returns a list of count/page/data
  store a retrieved-at key with each model in byId
  if a collection times out - (const... 10 minutes?), fetch the new page
- selectRecord: loads a single record into byId, then returns it.
  - returns "Loading" if byId record doesn't exist. dispatches action.
  - returns "Loading" if byId record's fetchTime is too old. dispatches action.
  - returns error object if byId record's error is not null. TODO how do I know when to re-dispatch action?
  - returns record otherwise

#### these functions are action creators
- addRecord: creates a post request, but doesn't update byId until the response from the server
  - let component handle showing "save status" state
  - calling this function stores the new model in an action
  - return a promise with success/error TODO is this ok? is there a better way?
  - update byId on success, return new object
  - don't update byId on error, return error + unpersisted object
- updateRecord: creates a put request, but doesn't update byId until the response from the server
  - let component handle showing update button as clickable or not
  - calling this function stores the updated model in an action
  - return a promise with success/error TODO is this ok? is there a better way?
  - update byId on success, return new object
  - don't update byId on error, return error + unpersisted object
- deleteRecord: creates a delete request, but doesn't update byId until the response from the server
  - calling this function stores the id in the action
  - return a promise with success/error TODO is this ok? is there a better way?
  - remove element from byId on success, return "Success"
  - don't remove element from byId on error, return error + attempted id

### Definitions:

 - Model is an abstract type like "plans" or "countries"
   - it also refers to an object in state.models
 - Record is a single resource e.g. the plan with id=10
 - Collection is a number of records e.g. page 1 of plans
   - state.plans.collections refers to previously executed queries
   - a single collection is made up of params, the returned ids, and then metadata
 - fetch means to go to the server
 - select means to get the existing models from the state, or an object saying "please fetch this object!!"
