'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.fetchCollection = fetchCollection;
exports.fetchRecord = fetchRecord;
exports.createRecord = createRecord;
exports.updateRecord = updateRecord;
exports.deleteRecord = deleteRecord;
exports.clearActionStatus = clearActionStatus;
exports.apiCall = apiCall;
exports.clearModelData = clearModelData;

var _actionTypes = require('./actionTypes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function fetchCollection(model, path) {
  var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var fetchConfig = opts.fetchConfig || undefined;
  var method = opts.method || 'get';

  return {
    type: _actionTypes.FETCH,
    meta: {
      success: _actionTypes.FETCH_SUCCESS,
      failure: _actionTypes.FETCH_ERROR,
      params: params,
      model: model
    },
    payload: {
      fetchConfig: fetchConfig,
      method: method,
      path: path,
      params: params
    }
  };
}
/* global T $Shape */

function fetchRecord(model, id, path) {
  var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var opts = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var fetchConfig = opts.fetchConfig || undefined;
  var method = opts.method || 'get';

  return {
    type: _actionTypes.FETCH_ONE,
    meta: {
      success: _actionTypes.FETCH_ONE_SUCCESS,
      failure: _actionTypes.FETCH_ONE_ERROR,
      model: model,
      id: id
    },
    payload: {
      fetchConfig: fetchConfig,
      method: method,
      path: path,
      params: params
    }
  };
}

function createRecord(model, path) {
  var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var opts = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var fetchConfig = opts.fetchConfig || undefined;
  var method = opts.method || 'post';

  return {
    type: _actionTypes.CREATE,
    meta: {
      success: _actionTypes.CREATE_SUCCESS,
      failure: _actionTypes.CREATE_ERROR,
      model: model
    },
    payload: {
      fetchConfig: fetchConfig,
      method: method,
      path: path,
      data: data,
      params: params
    }
  };
}

function updateRecord(model, id, path) {
  var data = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var params = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var opts = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

  var fetchConfig = opts.fetchConfig || undefined;
  var method = opts.method || 'put';

  return {
    type: _actionTypes.UPDATE,
    meta: {
      success: _actionTypes.UPDATE_SUCCESS,
      failure: _actionTypes.UPDATE_ERROR,
      model: model,
      id: id
    },
    payload: {
      fetchConfig: fetchConfig,
      method: method,
      path: path,
      data: data,
      params: params
    }
  };
}

function deleteRecord(model, id, path) {
  var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var opts = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var fetchConfig = opts.fetchConfig || undefined;
  var method = opts.method || 'delete';

  return {
    type: _actionTypes.DELETE,
    meta: {
      success: _actionTypes.DELETE_SUCCESS,
      failure: _actionTypes.DELETE_ERROR,
      model: model,
      id: id
    },
    payload: {
      fetchConfig: fetchConfig,
      method: method,
      path: path,
      params: params
    }
  };
}

function clearActionStatus(model, action) {
  return {
    type: _actionTypes.CLEAR_ACTION_STATUS,
    payload: { model: model, action: action }
  };
}

function apiCall(success, failure, method, path) {
  var params = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var data = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;
  var opts = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : {};

  var meta = opts.meta || {};
  var fetchConfig = opts.fetchConfig || undefined;

  return {
    type: _actionTypes.API_CALL,
    meta: (0, _extends3.default)({}, meta, {
      success: success,
      failure: failure
    }),
    payload: {
      fetchConfig: fetchConfig,
      method: method,
      path: path,
      params: params,
      data: data
    }
  };
}

function clearModelData(model) {
  return {
    type: _actionTypes.CLEAR_MODEL_DATA,
    payload: {
      model: model
    }
  };
}