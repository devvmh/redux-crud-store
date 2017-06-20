'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.apiGeneric = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
/* global Generator */

exports.default = crudSaga;

var _effects = require('redux-saga/effects');

var _actionTypes = require('./actionTypes');

// Generator type parameters are: Generator<+Yield,+Return,-Next>

// NOTE: need to avoid hoisting generator functions or they'll happen
// before this definition. See garbageCollector definition below, e.g.


// TODO: The `Effect` type is not actually defined. Because 'redux-saga' does
// not use  annotations, flow pretends that this import succeeds.
var regeneratorRuntime = require('regenerator-runtime');

var delay = function delay(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
};

var garbageCollector = regeneratorRuntime.mark(function garbageCollector() {
  return regeneratorRuntime.wrap(function garbageCollector$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _effects.call)(delay, 10 * 60 * 1000);

        case 2:
          _context.next = 4;
          return (0, _effects.call)(delay, 5 * 60 * 1000);

        case 4:
          _context.next = 6;
          return (0, _effects.put)({ type: _actionTypes.GARBAGE_COLLECT, meta: { now: Date.now() } });

        case 6:
          _context.next = 2;
          break;

        case 8:
        case 'end':
          return _context.stop();
      }
    }
  }, garbageCollector, this);
});

var apiGeneric = exports.apiGeneric = function apiGeneric(apiClient) {
  return regeneratorRuntime.mark(function _apiGeneric(action) {
    var _action$payload, method, path, params, data, fetchConfig, _action$meta, success, failure, meta, response;

    return regeneratorRuntime.wrap(function _apiGeneric$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _action$payload = action.payload, method = _action$payload.method, path = _action$payload.path, params = _action$payload.params, data = _action$payload.data, fetchConfig = _action$payload.fetchConfig;
            _action$meta = action.meta, success = _action$meta.success, failure = _action$meta.failure;
            meta = _extends({}, action.meta, {
              fetchTime: Date.now()
            });
            _context2.prev = 3;
            _context2.next = 6;
            return (0, _effects.call)(apiClient[method], path, { params: params, data: data, fetchConfig: fetchConfig });

          case 6:
            response = _context2.sent;
            _context2.next = 9;
            return (0, _effects.put)({ meta: meta, type: success, payload: response });

          case 9:
            _context2.next = 15;
            break;

          case 11:
            _context2.prev = 11;
            _context2.t0 = _context2['catch'](3);
            _context2.next = 15;
            return (0, _effects.put)({ meta: meta, type: failure, payload: _context2.t0, error: true });

          case 15:
          case 'end':
            return _context2.stop();
        }
      }
    }, _apiGeneric, this, [[3, 11]]);
  });
};

var watchFetch = function watchFetch(apiClient) {
  return regeneratorRuntime.mark(function _watchFetch() {
    return regeneratorRuntime.wrap(function _watchFetch$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _effects.takeEvery)(_actionTypes.FETCH, apiGeneric(apiClient));

          case 2:
          case 'end':
            return _context3.stop();
        }
      }
    }, _watchFetch, this);
  });
};

var watchFetchOne = function watchFetchOne(apiClient) {
  return regeneratorRuntime.mark(function _watchFetchOne() {
    return regeneratorRuntime.wrap(function _watchFetchOne$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return (0, _effects.takeEvery)(_actionTypes.FETCH_ONE, apiGeneric(apiClient));

          case 2:
          case 'end':
            return _context4.stop();
        }
      }
    }, _watchFetchOne, this);
  });
};

var watchCreate = function watchCreate(apiClient) {
  return regeneratorRuntime.mark(function _watchCreate() {
    return regeneratorRuntime.wrap(function _watchCreate$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return (0, _effects.takeEvery)(_actionTypes.CREATE, apiGeneric(apiClient));

          case 2:
          case 'end':
            return _context5.stop();
        }
      }
    }, _watchCreate, this);
  });
};

var watchUpdate = function watchUpdate(apiClient) {
  return regeneratorRuntime.mark(function _watchUpdate() {
    return regeneratorRuntime.wrap(function _watchUpdate$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return (0, _effects.takeEvery)(_actionTypes.UPDATE, apiGeneric(apiClient));

          case 2:
          case 'end':
            return _context6.stop();
        }
      }
    }, _watchUpdate, this);
  });
};

var watchDelete = function watchDelete(apiClient) {
  return regeneratorRuntime.mark(function _watchDelete() {
    return regeneratorRuntime.wrap(function _watchDelete$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return (0, _effects.takeEvery)(_actionTypes.DELETE, apiGeneric(apiClient));

          case 2:
          case 'end':
            return _context7.stop();
        }
      }
    }, _watchDelete, this);
  });
};

var watchApiCall = function watchApiCall(apiClient) {
  return regeneratorRuntime.mark(function _watchApiCall() {
    return regeneratorRuntime.wrap(function _watchApiCall$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return (0, _effects.takeEvery)(_actionTypes.API_CALL, apiGeneric(apiClient));

          case 2:
          case 'end':
            return _context8.stop();
        }
      }
    }, _watchApiCall, this);
  });
};

function crudSaga(apiClient) {
  return regeneratorRuntime.mark(function _crudSaga() {
    return regeneratorRuntime.wrap(function _crudSaga$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return (0, _effects.all)([(0, _effects.fork)(watchFetch(apiClient)), (0, _effects.fork)(watchFetchOne(apiClient)), (0, _effects.fork)(watchCreate(apiClient)), (0, _effects.fork)(watchUpdate(apiClient)), (0, _effects.fork)(watchDelete(apiClient)), (0, _effects.fork)(watchApiCall(apiClient)), (0, _effects.fork)(garbageCollector)]);

          case 2:
          case 'end':
            return _context9.stop();
        }
      }
    }, _crudSaga, this);
  });
}