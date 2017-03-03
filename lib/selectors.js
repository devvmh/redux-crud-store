'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
/* global T */
/* eslint no-use-before-define: 0 */

exports.select = select;
exports.selectCollection = selectCollection;
exports.selectRecord = selectRecord;
exports.selectRecordOrEmptyObject = selectRecordOrEmptyObject;
exports.selectActionStatus = selectActionStatus;

var _immutable = require('immutable');

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _actionTypes = require('./actionTypes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Returns false if:
 *  - fetchTime is more than 10 minutes ago
 *  - fetchTime is null (hasn't been set yet)
 *  - fetchTime is 0 (but note, this won't return NEEDS_FETCH)
 */


// TODO: `State` is not actually defined yet
function recent(fetchTime) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (fetchTime === null) return false;

  var interval = opts.interval || 10 * 60 * 1000; // ten minutes

  return Date.now() - interval < fetchTime;
}

function select(action, crud) {
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var model = action.meta.model;
  var params = action.payload.params;
  var id = void 0;
  var selection = void 0;
  switch (action.type) {
    case _actionTypes.FETCH:
      selection = selectCollection(model, crud, params);
      break;
    case _actionTypes.FETCH_ONE:
      id = action.meta.id;
      if (id == null) {
        throw new Error('Selecting a record, but no ID was given');
      }
      selection = getRecordSelection(model, id, crud, opts);
      break;
    default:
      throw new Error('Action type \'' + action.type + '\' is not a fetch action.');
  }
  selection.fetch = action;
  return selection;
}

function selectCollection(modelName, crud) {
  var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var model = crud.getIn([modelName], (0, _immutable.Map)());
  var collection = model.get('collections', (0, _immutable.List)()).find(function (coll) {
    return (0, _lodash2.default)(coll.get('params').toJS(), params);
  });

  var isLoading = function isLoading(_ref) {
    var needsFetch = _ref.needsFetch;
    return _extends({
      otherInfo: {},
      data: [],
      isLoading: true
    }, collection ? { error: collection.get('error') } : {}, {
      needsFetch: needsFetch
    });
  };

  // find the collection that has the same params
  if (collection === undefined) {
    return isLoading({ needsFetch: true });
  }

  var fetchTime = collection.get('fetchTime');
  if (fetchTime === 0) {
    return isLoading({ needsFetch: false });
  } else if (!recent(fetchTime, opts)) {
    return isLoading({ needsFetch: true });
  }

  // search the records to ensure they're all recent
  // TODO can we make this faster?
  var itemThatNeedsFetch = null;
  collection.get('ids', (0, _immutable.fromJS)([])).forEach(function (id) {
    // eslint-disable-line consistent-return
    var item = model.getIn(['byId', id.toString()], (0, _immutable.Map)());
    var itemFetchTime = item.get('fetchTime');
    // if fetchTime on the record is 0, don't set the whole collection to isLoading
    if (itemFetchTime !== 0 && !recent(item.get('fetchTime'), opts)) {
      itemThatNeedsFetch = item;
      return false;
    }
  });
  if (itemThatNeedsFetch) {
    return isLoading({ needsFetch: true });
  }

  var data = collection.get('ids', (0, _immutable.fromJS)([])).map(function (id) {
    return model.getIn(['byId', id.toString(), 'record']);
  }).toJS();

  return _extends({
    otherInfo: collection.get('otherInfo', (0, _immutable.Map)()).toJS(),
    data: data,
    isLoading: false,
    needsFetch: false
  }, collection ? { error: collection.get('error') } : {});
}

function getRecordSelection(modelName, id, crud) {
  var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var id_str = id ? id.toString() : undefined;
  var model = crud.getIn([modelName, 'byId', id_str]);

  if (model && model.get('fetchTime') === 0) {
    return { isLoading: true, needsFetch: false, error: new Error('Loading...') };
  }
  if (id === undefined || model === undefined || !recent(model.get('fetchTime'), opts)) {
    return { isLoading: true, needsFetch: true, error: new Error('Loading...') };
  }

  if (model.get('error') !== null) {
    return {
      isLoading: false,
      needsFetch: false,
      error: model.get('error')
    };
  }
  return {
    isLoading: false,
    needsFetch: false,
    data: model.get('record').toJS()
  };
}

function selectRecord(modelName, id, crud) {
  var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var sel = getRecordSelection(modelName, id, crud, opts);
  if (sel.data) {
    return sel.data;
  }
  return sel;
}

function selectRecordOrEmptyObject(modelName, id, crud) {
  var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var record = selectRecord(modelName, id, crud, opts);
  if (record.isLoading || record.error) {
    return {};
  }
  return record;
}

function selectActionStatus(modelName, crud, action) {
  var rawStatus = (crud.getIn([modelName, 'actionStatus', action]) || (0, _immutable.fromJS)({})).toJS();
  var _rawStatus$pending = rawStatus.pending,
      pending = _rawStatus$pending === undefined ? false : _rawStatus$pending,
      _rawStatus$id = rawStatus.id,
      id = _rawStatus$id === undefined ? null : _rawStatus$id,
      _rawStatus$isSuccess = rawStatus.isSuccess,
      isSuccess = _rawStatus$isSuccess === undefined ? null : _rawStatus$isSuccess,
      _rawStatus$payload = rawStatus.payload,
      payload = _rawStatus$payload === undefined ? null : _rawStatus$payload;


  if (pending === true) {
    return { id: id, pending: pending };
  }
  if (isSuccess === true) {
    return {
      id: id,
      pending: pending,
      response: payload
    };
  }
  return {
    id: id,
    pending: pending,
    error: payload
  };
}