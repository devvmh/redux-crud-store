# redux-crud-store - a reusable API for syncing models with a backend

Making a single page application (SPA)? Using a Redux store?

This module contains helper functions to make it easier to keep your models in sync with a backend. In particular, it provides these four things:

1. **It handles async for you**, using redux-saga. A middleware will watch for your async send actions, and will dispatch the success/error actions when the call is complete.
2. It implements a **default reducer for all of your backend models**. This reducer will handle your async send, success, and failure actions, and store them in your redux store in an intelligent way.
3. You can **quickly write action creators** for this reducer using the predefined constants and action creators exported by redux-crud-store.
4. It provides **selector functions for your components**, which query the store and return a collection of models, a single model, or an object saying "wait for me to load" or "you need to dispatch another fetch action"

# How to use it

See [docs/API.md](https://github.com/uniqueway/redux-crud-store/blob/master/docs/API.md) for usage.

There are four ways to integrate redux-crud-store into your app:

1. Set up a redux-saga middleware
2. Add the reducer to your store
3. Create action creators for your specific models
4. Use redux-crud-store's selectors and your action creators in your components

### 1. Set up a redux-saga middleware

You'll need to write an ApiClient that looks something like this:

    import superagent from 'superagent'

    const base_path = 'https://example.com/api/v3'
    const methods = ['get', 'post', 'put', 'patch', 'del']

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

You don't need to use this exact code, but you must match the API. See [src/sagas.js](https://github.com/uniqueway/redux-crud-store/blob/master/src/sagas.js) for how this client is called.

Once you've done that, you can create a redux-saga middleware and add it to your store:

    import { createStore, applyMiddleware, compose } from 'redux'
    import createSagaMiddleware from 'redux-saga'

    import { crudSaga } from 'redux-crud-store'
    import { ApiClient } from './util/ApiClient' // write this yourself!

    const client = new ApiClient()
    const crudMiddleware = createSagaMiddleware(crudSaga(client))

    const createStoreWithMiddleware = compose(
      applyMiddleware(
        crudMiddleware
        // add other middlewares here...
      )
    )(createStore)

    // then use createStoreWithMiddleware as you like

### 2. Add the reducer to your store

This step is a bit easier! If you like combining your reducers in one file, here's what that file might look like:

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

redux-crud-store is based on a RESTful API. If you need support for non-restful endpoints, take a look at the apiCall function in [src/actionCreators.js](https://github.com/uniqueway/redux-crud-store/blob/master/src/actionCreators.js) and/or submit a pull request!

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

### Collection caching

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


### What's still missing (TODO)

- default fetch client could be included, to make saga setup easier
- allow dispatching multiple actions for API_CALL
- consider allowing dispatching multiple actions for CREATE/UPDATE/DELETE
- it would be great to support nested models - automatically stripping the models out of a parent object, moving them into their own store, and storing the parent with just an id reference. This might make component logic kind of intense if we aren't careful.
- configurable keys: This module is still mostly agnostic about the format your data comes in from the server as, but in particular it expects records to live in response.data when running FETCH, and it expects all records to have an id attribute. It would be great to analyze this further and make those keys configurable.
- tests for every public function
- tests for every private function too

### Brief layout of what state.models should look like

This is a slightly airbrushed representation of what the state.models key in your store might look like, if it were represented as JSON instead of with Immutable JS.

    state.models : {
      posts: {
        collections: [
          {
            params: {
              no_pagination: true
            },
            otherInfo: null,
            ids: [ 15000, 15001, ... ],
            fetchTime: 1325355325,
            error: null
          },
          {
            params: {
              page: 1
            },
            otherInfo: {
              page: {
                self: 1,
                next: 2,
                prev: 0
              }
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
          create: { pending: false, id: null, isSuccess: true, payload: null },
          update: { pending: false,
                    id: 8,
                    isSuccess: false, 
                    payload: {
                      message: "Invalid id",
                      errors: { "editor_id": "not an editor" }
                    }
                  },
          delete: { pending: true, id: 45 }
        }
      },
      comments: {
        // the exact same layout as post...
      },
    }

### Glossary of frequently used terms:

 - Model is an abstract type like "posts" or "comments"
   - it also refers to an object in state.models
 - Record is a single resource e.g. the post with id=10
 - Collection is a number of records e.g. page 1 of posts
   - state.posts.collections refers to previously executed queries
   - a single collection is made up of params, the returned ids, and then metadata
 - fetch means to go to the server
 - select means to get the existing models from the state, or an object that communicates to the component that it should dispatch a fetch action
