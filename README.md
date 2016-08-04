# redux-crud-store - a reusable API for syncing models with a backend

[![NPM Version](https://img.shields.io/npm/v/redux-crud-store.svg?style=flat)](https://www.npmjs.com/package/redux-crud-store)
[![NPM Downloads](https://img.shields.io/npm/dm/redux-crud-store.svg?style=flat)](https://www.npmjs.com/package/redux-crud-store)


Making a single page application (SPA)? Using a Redux store? Tired of writing the same code for every API endpoint?

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

The first step is to import ApiClient and crudSaga from redux-crud-store, which will automate async tasks for you. If your app uses JSON in requests, all you need to do is provide a basePath for the ApiClient, which will be prepended to all of your requests. (See [ApiClient.js](https://github.com/uniqueway/redux-crud-store/blob/master/src/ApiClient.js) for more config options). Once you've done that, you can create a redux-saga middleware and add it to your redux store using this code:

    import 'babel-polyfill' // needed for IE 11, Edge 12, Safari 9
    import createSagaMiddleware from 'redux-saga'

    import { createStore, applyMiddleware, compose } from 'redux'
    import { crudSaga, ApiClient } from 'redux-crud-store'

    const client = new ApiClient({ basePath: 'https://example.com/api/v1' })
    const crudMiddleware = createSagaMiddleware()

    const createStoreWithMiddleware = compose(
      applyMiddleware(
        crudMiddleware
        // add other middlewares here...
      )
    )(createStore)
    crudMiddleware.run(crudSaga(client))

    // then use createStoreWithMiddleware as you like

This requires fetch API support. If your clients won't support the fetch API, you will need to [write your own ApiClient](https://github.com/uniqueway/redux-crud-store/blob/feature/api-client/docs/Sample-Api-Client-with-Superagent.md).

### 2. Add the reducer to your store

If you like combining your reducers in one file, here's what that file might look like:

    import { combineReducers } from 'redux'
    import { crudReducer } from 'redux-crud-store'

    export default combineReducers({
      models: crudReducer,
      // other reducers go here
    })

### 3. Create action creators for your specific models

Now that the boilerplate is out of the way, you can start being productive with your own API. A given model might use very predictable endpoints, or it might need a lot of logic. You can make your action creators very quickly by basing them off of redux-crud-store's API:

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
    import { mapStateToProps, mapDispatchToProps, connect } from 'react-redux'

    import { fetchPosts } from '../../redux/modules/posts'
    import { select } from 'redux-crud-store'

    class List extends React.Component {
      componentWillMount() {
        const { posts, dispatch } = this.props
        if (posts.needsFetch) {
          dispatch(posts.fetch)
        }
      }

      componentWillReceiveProps(nextProps) {
        const { posts } = nextProps
        const { dispatch } = this.props
        if (posts.needsFetch) {
          dispatch(posts.fetch)
        }
      }

      render() {
        const { posts } = this.props
        if (posts.isLoading) {
          return <div>
            <p>loading...</p>
          </div>
        } else {
          return <div>
            {posts.data.map(post => <li key={post.id}>{post.title}</li>)}
          </div>
        }
      }
    }

    function mapStateToProps(state, ownProps) {
      return { posts: select(fetchPosts({ page: 1 }), state.models) }
    }

    export default connect(mapStateToProps)(List)

Fetching a single record is very similar. A typical component for editing a single record might implement these functions:

    import { fetchPost } from '../../redux/modules/posts'
    import {
      clearActionStatus, select, selectActionStatus
    } from 'redux-crud-store'

    ....

    componentWillMount() {
      const { posts, dispatch } = this.props
      if (posts.needsFetch) {
        dispatch(posts.fetch)
      }
    }

    componentWillReceiveProps(nextProps) {
      const { posts, status } = nextProps
      const { dispatch } = this.props
      if (posts.needsFetch) {
        dispatch(posts.fetch)
      }
      if (status.isSuccess) {
        dispatch(clearActionStatus('post', 'update'))
      }
    }

    disableSubmitButton = () => {
      // this function would return true if you should disable the submit
      // button on your form - because you've already sent a PUT request
      return !!this.props.status.pending
    }

    ....

    function mapStateToProps(state, ownProps) {
      return {
        post: select(fetchPost(ownProps.id), state.models),
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

# License

Copyright 2016 Devin Howard

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
