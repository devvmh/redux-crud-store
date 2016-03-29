# redux-crud-store - a reusable API for syncing models with a backend

This module contains four things:

2. A redux-saga saga that you can add to your middlewares to send the async calls for CRUD actions, and also to dispatch the success/error actions when the call is complete.
1. A reducer that handles the async send, async success, and async failure actions, and stores the results in an intelligent way in your redux store.
3. Constants and action creators for each action type.
4. Selector functions, which return a collection of models, a single model, or an object saying "wait for me to load" or "you need to dispatch another fetch action"

## How to use it

TODO

## What's still missing

 - it would be great to have a garbage collector using redux-saga
 - default fetch client could be included, to make saga setup easier
 - expand support for the generic API_CALL action
 - allow dispatching multiple actions for API_CALL
 - consider allowing dispatching multiple actions for CREATE/UPDATE/DELETE

## The original documentation

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
