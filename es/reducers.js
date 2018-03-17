'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.modelReducer = exports.actionStatusReducer = exports.collectionsReducer = exports.collectionReducer = exports.byIdReducer = exports.modelInitialState = undefined;

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _devMessage = require('./devMessage');

var _devMessage2 = _interopRequireDefault(_devMessage);

var _cachePeriod = require('./cachePeriod');

var _actionTypes = require('./actionTypes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /* eslint no-case-declarations: 0 */

/*
 * SECTION: initial states
 */

var byIdInitialState = {};

var collectionInitialState = {
  params: {},
  otherInfo: {},
  ids: [],
  fetchTime: null,
  error: null
};

var collectionsInitialState = [];

var actionStatusInitialState = {
  create: {},
  update: {},
  delete: {}
};

var modelInitialState = exports.modelInitialState = {
  byId: byIdInitialState,
  collections: collectionsInitialState,
  actionStatus: actionStatusInitialState
};

// holds a number of models, each of which are strucured like modelInitialState
var initialState = {};

/*
 * SECTION: reducers
 */

// server data is canonical, so blast away the old data
function byIdReducerImpl() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : byIdInitialState;
  var action = arguments[1];

  var id = action.meta ? action.meta.id : undefined;
  var newState = void 0; // should only be used once per invocation
  switch (action.type) {
    case _actionTypes.FETCH_SUCCESS:
      var data = {};
      var payload = 'data' in action.payload ? action.payload.data : action.payload;
      payload.forEach(function (record) {
        data[record.id] = {
          fetchTime: action.meta.fetchTime,
          error: null,
          record: record
        };
      });
      return Object.assign({}, state, data);
    case _actionTypes.FETCH_ONE:
      return Object.assign({}, state, _defineProperty({}, id, {
        fetchTime: 0,
        error: null,
        record: null
      }));
    case _actionTypes.FETCH_ONE_SUCCESS:
      return Object.assign({}, state, _defineProperty({}, id, {
        fetchTime: action.meta.fetchTime,
        error: null,
        record: action.payload
      }));
    case _actionTypes.FETCH_ONE_ERROR:
      return Object.assign({}, state, _defineProperty({}, id, {
        fetchTime: action.meta.fetchTime,
        error: action.payload,
        record: null
      }));
    case _actionTypes.CREATE_SUCCESS:
      return Object.assign({}, state, _defineProperty({}, action.payload.id, {
        fetchTime: action.meta.fetchTime,
        error: null,
        record: action.payload
      }));
    case _actionTypes.UPDATE:
      return Object.assign({}, state, _defineProperty({}, id, state[id] === undefined ? undefined : {
        fetchTime: 0,
        error: state[id].error,
        record: state[id].record
      }));
    case _actionTypes.UPDATE_SUCCESS:
      return Object.assign({}, state, _defineProperty({}, id, {
        fetchTime: action.meta.fetchTime,
        error: null,
        record: 'data' in action.payload ? action.payload.data : action.payload
      }));
    case _actionTypes.DELETE_SUCCESS:
      newState = Object.assign({}, state);
      delete newState[id];
      return newState;
    case _actionTypes.GARBAGE_COLLECT:
      newState = Object.assign({}, state);
      var cutoff = (0, _cachePeriod.cachePeriodAgo)(action.meta.now, action.meta.cachePeriod);
      Object.keys(state).filter(function (key) {
        return newState[key].fetchTime < cutoff;
      }).forEach(function (key) {
        delete newState[key];
      });
      return newState;
    default:
      return state;
  }
}

/*
 * Note: fetchTime of null means "needs fetch"
 */
function collectionReducerImpl() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : collectionInitialState;
  var action = arguments[1];

  switch (action.type) {
    case _actionTypes.FETCH:
      return Object.assign({}, state, {
        params: action.meta.params,
        fetchTime: 0,
        error: null
      });
    case _actionTypes.FETCH_SUCCESS:
      var originalPayload = action.payload || {};
      var payload = 'data' in originalPayload ? originalPayload.data : originalPayload;
      var otherInfo = 'data' in originalPayload ? Object.assign({}, originalPayload) : {};
      delete otherInfo.data;
      if (!Array.isArray(payload)) {
        (0, _devMessage2.default)('\n          Payload is not an array! Your server response for a FETCH action\n          should be in one of the following forms:\n\n          { data: [ ... ] }\n\n          or\n\n          [ ... ]\n\n          Here are the contents of your action:');
        (0, _devMessage2.default)(JSON.stringify(action));
      }
      var ids = payload.map(function (elt) {
        return elt.id;
      });
      return Object.assign({}, state, {
        params: action.meta.params,
        ids: ids,
        otherInfo: otherInfo,
        error: null,
        fetchTime: action.meta.fetchTime
      });
    case _actionTypes.FETCH_ERROR:
      return Object.assign({}, state, {
        params: action.meta.params,
        error: action.payload
      });
    default:
      return state;
  }
}

function collectionsReducerImpl() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : collectionsInitialState;
  var action = arguments[1];

  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$collectionReduce = _ref.collectionReducer,
      collectionReducer = _ref$collectionReduce === undefined ? collectionReducerImpl : _ref$collectionReduce;

  switch (action.type) {
    case _actionTypes.FETCH:
    case _actionTypes.FETCH_SUCCESS:
    case _actionTypes.FETCH_ERROR:
      // create the collection for the given params if needed
      // entry will be undefined or [index, existingCollection]
      if (action.meta.params === undefined) {
        return state;
      }
      var index = state.findIndex(function (coll) {
        return (0, _lodash2.default)(coll.params, action.meta.params);
      });
      if (index === -1) {
        return state.concat([collectionReducer(undefined, action)]);
      }

      return state.slice(0, index).concat([collectionReducer(state[index], action)]).concat(state.slice(index + 1));
    case _actionTypes.CREATE_SUCCESS:
    case _actionTypes.DELETE_SUCCESS:
      // set fetchTime on all entries to null
      return state.map(function (item, idx) {
        return Object.assign({}, item, { fetchTime: null });
      });
    case _actionTypes.GARBAGE_COLLECT:
      return state.filter(function (collection) {
        return collection.fetchTime > (0, _cachePeriod.cachePeriodAgo)(action.meta.now, action.meta.cachePeriod) || collection.fetchTime === null;
      });
    default:
      return state;
  }
}

function actionStatusReducerImpl() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : actionStatusInitialState;
  var action = arguments[1];

  switch (action.type) {
    case _actionTypes.CLEAR_ACTION_STATUS:
      return Object.assign({}, state, _defineProperty({}, action.payload.action, {}));
    case _actionTypes.CREATE:
      return Object.assign({}, state, {
        create: {
          pending: true,
          id: null
        }
      });
    case _actionTypes.CREATE_SUCCESS:
    case _actionTypes.CREATE_ERROR:
      return Object.assign({}, state, {
        create: {
          pending: false,
          id: action.payload.id,
          isSuccess: !action.error,
          payload: action.payload
        }
      });
    case _actionTypes.UPDATE:
      return Object.assign({}, state, {
        update: {
          pending: true,
          id: action.meta.id
        }
      });
    case _actionTypes.UPDATE_SUCCESS:
    case _actionTypes.UPDATE_ERROR:
      return Object.assign({}, state, {
        update: {
          pending: false,
          id: action.meta.id,
          isSuccess: !action.error,
          payload: action.payload
        }
      });
    case _actionTypes.DELETE:
      return Object.assign({}, state, {
        delete: {
          pending: true,
          id: action.meta.id
        }
      });
    case _actionTypes.DELETE_SUCCESS:
    case _actionTypes.DELETE_ERROR:
      return Object.assign({}, state, {
        delete: {
          pending: false,
          id: action.meta.id,
          isSuccess: !action.error,
          payload: action.payload // probably null...
        }
      });
    default:
      return state;
  }
}

function modelReducerImpl() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref2$actionStatusRed = _ref2.actionStatusReducer,
      actionStatusReducer = _ref2$actionStatusRed === undefined ? actionStatusReducerImpl : _ref2$actionStatusRed,
      _ref2$byIdReducer = _ref2.byIdReducer,
      byIdReducer = _ref2$byIdReducer === undefined ? byIdReducerImpl : _ref2$byIdReducer,
      _ref2$collectionsRedu = _ref2.collectionsReducer,
      collectionsReducer = _ref2$collectionsRedu === undefined ? collectionsReducerImpl : _ref2$collectionsRedu;

  var id = action.meta ? action.meta.id : undefined;
  switch (action.type) {
    case _actionTypes.GARBAGE_COLLECT:
      return Object.assign({}, state, {
        collections: collectionsReducer(state.collections, action),
        byId: byIdReducer(state.byId, action)
      });
    case _actionTypes.CLEAR_MODEL_DATA:
      return Object.assign({}, modelInitialState);
    case _actionTypes.CLEAR_ACTION_STATUS:
      return Object.assign({}, state, {
        actionStatus: actionStatusReducer(state.actionStatus, action)
      });
    case _actionTypes.FETCH:
    case _actionTypes.FETCH_SUCCESS:
    case _actionTypes.FETCH_ERROR:
      return Object.assign({}, state, {
        collections: collectionsReducer(state.collections, action),
        byId: byIdReducer(state.byId, action)
      });
    case _actionTypes.FETCH_ONE:
    case _actionTypes.FETCH_ONE_SUCCESS:
    case _actionTypes.FETCH_ONE_ERROR:
      return Object.assign({}, state, {
        byId: byIdReducer(state.byId, action)
      });
    case _actionTypes.CREATE:
      return Object.assign({}, state, {
        actionStatus: actionStatusReducer(state.actionStatus, action)
      });
    case _actionTypes.CREATE_SUCCESS:
      return Object.assign({}, state, {
        collections: collectionsReducer(state.collections, action),
        byId: byIdReducer(state.byId, action),
        actionStatus: actionStatusReducer(state.actionStatus, action)
      });
    case _actionTypes.CREATE_ERROR:
      return Object.assign({}, state, {
        actionStatus: actionStatusReducer(state.actionStatus, action)
      });
    case _actionTypes.UPDATE:
    case _actionTypes.UPDATE_SUCCESS:
    case _actionTypes.UPDATE_ERROR:
      return Object.assign({}, state, {
        byId: byIdReducer(state.byId, action),
        actionStatus: actionStatusReducer(state.actionStatus, action)
      });
    case _actionTypes.DELETE:
    case _actionTypes.DELETE_SUCCESS:
    case _actionTypes.DELETE_ERROR:
      return Object.assign({}, state, {
        collections: collectionsReducer(state.collections, action),
        byId: byIdReducer(state.byId, action),
        actionStatus: actionStatusReducer(state.actionStatus, action)
      });
    default:
      return state;
  }
}

function crudReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref3$actionStatusRed = _ref3.actionStatusReducer,
      actionStatusReducer = _ref3$actionStatusRed === undefined ? actionStatusReducerImpl : _ref3$actionStatusRed,
      _ref3$byIdReducer = _ref3.byIdReducer,
      byIdReducer = _ref3$byIdReducer === undefined ? byIdReducerImpl : _ref3$byIdReducer,
      _ref3$collectionsRedu = _ref3.collectionsReducer,
      collectionsReducer = _ref3$collectionsRedu === undefined ? collectionsReducerImpl : _ref3$collectionsRedu;

  switch (action.type) {
    case _actionTypes.GARBAGE_COLLECT:
      return Object.keys(state).reduce(function (newState, model) {
        return Object.assign({}, newState, _defineProperty({}, model, modelReducerImpl(state[model], action, {
          actionStatusReducer: actionStatusReducer, byIdReducer: byIdReducer, collectionsReducer: collectionsReducer
        })));
      }, {});
    case _actionTypes.CLEAR_MODEL_DATA:
    case _actionTypes.CLEAR_ACTION_STATUS:
    case _actionTypes.FETCH:
    case _actionTypes.FETCH_SUCCESS:
    case _actionTypes.FETCH_ERROR:
    case _actionTypes.FETCH_ONE:
    case _actionTypes.FETCH_ONE_SUCCESS:
    case _actionTypes.FETCH_ONE_ERROR:
    case _actionTypes.CREATE:
    case _actionTypes.CREATE_SUCCESS:
    case _actionTypes.CREATE_ERROR:
    case _actionTypes.UPDATE:
    case _actionTypes.UPDATE_SUCCESS:
    case _actionTypes.UPDATE_ERROR:
    case _actionTypes.DELETE:
    case _actionTypes.DELETE_SUCCESS:
    case _actionTypes.DELETE_ERROR:
      var model = action.meta && action.meta.model || action.payload.model;
      return Object.assign({}, state, _defineProperty({}, model, modelReducerImpl(state[model], action, {
        actionStatusReducer: actionStatusReducer, byIdReducer: byIdReducer, collectionsReducer: collectionsReducer
      })));
    default:
      return state;
  }
}

exports.byIdReducer = byIdReducerImpl;
exports.collectionReducer = collectionReducerImpl;
exports.collectionsReducer = collectionsReducerImpl;
exports.actionStatusReducer = actionStatusReducerImpl;
exports.modelReducer = modelReducerImpl;
exports.default = crudReducer;