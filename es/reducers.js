'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = crudReducer;

var _immutable = require('immutable');

var _actionTypes = require('./actionTypes');

/*
 * SECTION: initial states
 */

var byIdInitialState = (0, _immutable.fromJS)({});

var collectionInitialState = (0, _immutable.fromJS)({
  params: {},
  otherInfo: {},
  ids: [],
  fetchTime: null,
  error: null
});

var collectionsInitialState = (0, _immutable.fromJS)([]);

var actionStatusInitialState = (0, _immutable.fromJS)({
  create: {},
  update: {},
  delete: {}
});

var modelInitialState = (0, _immutable.fromJS)({
  collections: [],
  byId: undefined,
  actionStatus: undefined
});

// holds a number of models, each of which are strucured like modelInitialState
var initialState = (0, _immutable.fromJS)({});

/*
 * SECTION: reducers
 */

// server data is canonical, so blast away the old data
function byIdReducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? byIdInitialState : arguments[0];
  var action = arguments[1];

  var id = action.meta ? action.meta.id : undefined;
  switch (action.type) {
    case _actionTypes.FETCH_SUCCESS:
      var data = state.toJS();
      action.payload.data.forEach(function (record) {
        data[record.id] = {
          record: record,
          fetchTime: action.meta.fetchTime,
          error: null
        };
      });
      return (0, _immutable.fromJS)(data);
    case _actionTypes.FETCH_ONE:
      return state.setIn([id.toString(), 'fetchTime'], 0).setIn([id.toString(), 'error'], null).setIn([id.toString(), 'record'], null);
    case _actionTypes.FETCH_ONE_SUCCESS:
      return state.setIn([id.toString(), 'fetchTime'], action.meta.fetchTime).setIn([id.toString(), 'error'], null).setIn([id.toString(), 'record'], (0, _immutable.fromJS)(action.payload));
    case _actionTypes.FETCH_ONE_ERROR:
      return state.setIn([id.toString(), 'fetchTime'], action.meta.fetchTime).setIn([id.toString(), 'error'], (0, _immutable.fromJS)(action.payload)).setIn([id.toString(), 'record'], null);
    case _actionTypes.CREATE_SUCCESS:
      var cid = action.payload.id;
      if (state.get(cid.toString()) !== undefined) {
        // console.error(`There was already a record at that id (${action.payload.id}) - erasing!`)
      }
      return state.set(action.payload.id.toString(), (0, _immutable.fromJS)({
        record: action.payload,
        fetchTime: action.meta.fetchTime,
        error: null
      }));
    case _actionTypes.UPDATE:
      return state.setIn([id.toString(), 'fetchTime'], 0);
    case _actionTypes.UPDATE_SUCCESS:
      return state.set(id.toString(), (0, _immutable.fromJS)({
        record: action.payload,
        fetchTime: action.meta.fetchTime,
        error: null
      }));
    case _actionTypes.UPDATE_ERROR:
      return state.setIn([id.toString(), 'error'], (0, _immutable.fromJS)(action.payload));
    case _actionTypes.DELETE_SUCCESS:
      return state.delete(id.toString());
    default:
      return state;
  }
}

/*
 * Note: fetchTime of null means "needs fetch"
 */
function collectionReducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? collectionInitialState : arguments[0];
  var action = arguments[1];

  var id = action.meta ? action.meta.id : undefined;
  var params = (0, _immutable.fromJS)(action.meta.params);
  if (params === undefined) {
    return state;
  }
  switch (action.type) {
    case _actionTypes.FETCH:
      return state.set('params', params).set('fetchTime', 0).set('error', null);
    case _actionTypes.FETCH_SUCCESS:
      var ids = action.payload.data.map(function (elt) {
        return elt.id;
      });
      return state.set('params', params).set('ids', (0, _immutable.fromJS)(ids)).set('otherInfo', (0, _immutable.fromJS)(action.payload || {}).delete('data')).set('error', null).set('fetchTime', action.meta.fetchTime);
    case _actionTypes.FETCH_ERROR:
      return state.set('params', params).set('error', action.payload);
    case _actionTypes.CREATE_SUCCESS:
      return state.set('params', params).set('fetchTime', null);
    case _actionTypes.DELETE_SUCCESS:
      return state.set('params', params).set('fetchTime', null);
    default:
      return state;
  }
}

function collectionsReducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? collectionsInitialState : arguments[0];
  var action = arguments[1];

  switch (action.type) {
    case _actionTypes.FETCH:
    case _actionTypes.FETCH_SUCCESS:
    case _actionTypes.FETCH_ERROR:
    case _actionTypes.CREATE_SUCCESS:
    case _actionTypes.DELETE_SUCCESS:
      // create the collection for the given params if needed
      // entry will be undefined or [index, existingCollection]
      var paramsJson = JSON.stringify(action.meta.params);
      var entry = state.findEntry(function (coll) {
        return JSON.stringify(coll.toJS().params) === paramsJson;
      });
      if (entry === undefined) {
        if (action.meta.params === undefined) {
          return state;
        }
        return state.push(collectionReducer(undefined, action));
      }
      // update the entry with the same params as before

      var _entry = _slicedToArray(entry, 2);

      var index = _entry[0];
      var existingCollection = _entry[1];

      var alteredAction = _extends({}, action, {
        meta: _extends({}, action.meta, {
          params: action.meta.params || existingCollection.params
        })
      });
      if (alteredAction.meta.params === undefined) {
        return state;
      }
      return state.update(index, function (s) {
        return collectionReducer(s, alteredAction);
      });
    default:
      return state;
  }
}

function actionStatusReducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? actionStatusInitialState : arguments[0];
  var action = arguments[1];

  switch (action.type) {
    case _actionTypes.CLEAR_ACTION_STATUS:
      return state.set(action.payload.action, (0, _immutable.fromJS)({}));
    case _actionTypes.CREATE:
      return state.set('create', (0, _immutable.fromJS)({
        pending: true,
        id: null
      }));
    case _actionTypes.CREATE_SUCCESS:
    case _actionTypes.CREATE_ERROR:
      return state.set('create', (0, _immutable.fromJS)({
        pending: false,
        id: action.payload.id,
        isSuccess: !action.error,
        payload: action.payload
      }));
    case _actionTypes.UPDATE:
      return state.set('update', (0, _immutable.fromJS)({
        pending: true,
        id: action.meta.id
      }));
    case _actionTypes.UPDATE_SUCCESS:
    case _actionTypes.UPDATE_ERROR:
      return state.set('update', (0, _immutable.fromJS)({
        pending: false,
        id: action.meta.id,
        isSuccess: !action.error,
        payload: action.payload
      }));
    case _actionTypes.DELETE:
      return state.set('delete', (0, _immutable.fromJS)({
        pending: true,
        id: action.meta.id
      }));
    case _actionTypes.DELETE_SUCCESS:
    case _actionTypes.DELETE_ERROR:
      return state.set('delete', (0, _immutable.fromJS)({
        pending: false,
        id: action.meta.id,
        isSuccess: !action.error,
        payload: action.payload // probably null...
      }));
    default:
      return state;
  }
}

function crudReducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
  var action = arguments[1];

  var id = action.meta ? action.meta.id : undefined;
  switch (action.type) {
    case _actionTypes.CLEAR_ACTION_STATUS:
      return state.updateIn([action.payload.model, 'actionStatus'], function (s) {
        return actionStatusReducer(s, action);
      });
    case _actionTypes.FETCH:
    case _actionTypes.FETCH_SUCCESS:
    case _actionTypes.FETCH_ERROR:
      return state.updateIn([action.meta.model, 'collections'], function (s) {
        return collectionsReducer(s, action);
      }).updateIn([action.meta.model, 'byId'], function (s) {
        return byIdReducer(s, action);
      });
    case _actionTypes.FETCH_ONE:
    case _actionTypes.FETCH_ONE_SUCCESS:
    case _actionTypes.FETCH_ONE_ERROR:
      return state.updateIn([action.meta.model, 'byId'], function (s) {
        return byIdReducer(s, action);
      });
    case _actionTypes.CREATE:
      return state.updateIn([action.meta.model, 'actionStatus'], function (s) {
        return actionStatusReducer(s, action);
      });
    case _actionTypes.CREATE_SUCCESS:
      return state.updateIn([action.meta.model, 'byId'], function (s) {
        return byIdReducer(s, action);
      }).updateIn([action.meta.model, 'collections'], (0, _immutable.fromJS)([]), function (list) {
        return list.map(function (s) {
          return collectionsReducer(s, action);
        });
      }).updateIn([action.meta.model, 'actionStatus'], function (s) {
        return actionStatusReducer(s, action);
      });
    case _actionTypes.CREATE_ERROR:
      return state.updateIn([action.meta.model, 'actionStatus'], function (s) {
        return actionStatusReducer(s, action);
      });
    case _actionTypes.UPDATE:
    case _actionTypes.UPDATE_SUCCESS:
    case _actionTypes.UPDATE_ERROR:
      return state.updateIn([action.meta.model, 'byId'], function (s) {
        return byIdReducer(s, action);
      }).updateIn([action.meta.model, 'actionStatus'], function (s) {
        return actionStatusReducer(s, action);
      });
    case _actionTypes.DELETE:
    case _actionTypes.DELETE_SUCCESS:
    case _actionTypes.DELETE_ERROR:
      return state.updateIn([action.meta.model, 'byId'], function (s) {
        return byIdReducer(s, action);
      }).updateIn([action.meta.model, 'collections'], (0, _immutable.fromJS)([]), function (list) {
        return list.map(function (s) {
          return collectionsReducer(s, action);
        });
      }).updateIn([action.meta.model, 'actionStatus'], function (s) {
        return actionStatusReducer(s, action);
      });
    default:
      return state;
  }
}