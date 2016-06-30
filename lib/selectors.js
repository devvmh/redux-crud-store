'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.select = select;
exports.selectCollection = selectCollection;
exports.selectRecord = selectRecord;
exports.selectRecordOrEmptyObject = selectRecordOrEmptyObject;
exports.selectActionStatus = selectActionStatus;
exports.selectNiceActionStatus = selectNiceActionStatus;

var _immutable = require('immutable');

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _actionTypes = require('./actionTypes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: `State` is not actually defined yet


var recentTimeInterval = 10 * 60 * 1000; // ten minutes

/*
 * Returns false if:
 *  - fetchTime is more than 10 minutes ago
 *  - fetchTime is null (hasn't been set yet)
 *  - fetchTime is 0 (but note, this won't return NEEDS_FETCH)
 */

/* global T */
/* eslint no-use-before-define: 0 */

function recent(fetchTime) {
  if (fetchTime === null) return false;

  return Date.now() - recentTimeInterval < fetchTime;
}

function select(action, crud) {
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
      selection = getRecordSelection(model, id, crud);
      break;
    default:
      throw new Error('Action type \'' + action.type + '\' is not a fetch action.');
  }
  selection.fetch = action;
  return selection;
}

function selectCollection(modelName, crud) {
  var params = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var isLoading = function isLoading(_ref) {
    var needsFetch = _ref.needsFetch;
    return {
      otherInfo: {},
      data: [],
      isLoading: true,
      needsFetch: needsFetch
    };
  };

  var model = crud.getIn([modelName], (0, _immutable.Map)());

  // find the collection that has the same params
  var collection = model.get('collections', (0, _immutable.List)()).find(function (coll) {
    return (0, _lodash2.default)(coll.get('params').toJS(), params);
  });
  if (collection === undefined) {
    return isLoading({ needsFetch: true });
  }

  var fetchTime = collection.get('fetchTime');
  if (fetchTime === 0) {
    return isLoading({ needsFetch: false });
  } else if (!recent(fetchTime)) {
    return isLoading({ needsFetch: true });
  }

  // search the records to ensure they're all recent
  // TODO can we make this faster?
  var itemNeedsFetch = null;
  collection.get('ids', (0, _immutable.fromJS)([])).forEach(function (id) {
    // eslint-disable-line consistent-return
    var item = model.getIn(['byId', id.toString()], (0, _immutable.Map)());
    if (!recent(item.get('fetchTime'))) {
      itemNeedsFetch = item;
      return false;
    }
  });
  if (itemNeedsFetch) {
    if (itemNeedsFetch.get('fetchTime') === 0) {
      return isLoading({ needsFetch: false });
    }
    return isLoading({ needsFetch: true });
  }

  var data = collection.get('ids', (0, _immutable.fromJS)([])).map(function (id) {
    return model.getIn(['byId', id.toString(), 'record']);
  }).toJS();

  return {
    otherInfo: collection.get('otherInfo', (0, _immutable.Map)()).toJS(),
    data: data,
    isLoading: false,
    needsFetch: false
  };
}

function getRecordSelection(modelName, id, crud) {
  var id_str = id ? id.toString() : undefined;
  var model = crud.getIn([modelName, 'byId', id_str]);

  if (model && model.get('fetchTime') === 0) {
    return { isLoading: true, needsFetch: false, error: new Error('Loading...') };
  }
  if (id === undefined || model === undefined || !recent(model.get('fetchTime'))) {
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
  var sel = getRecordSelection(modelName, id, crud);
  if (sel.data) {
    return sel.data;
  }
  return sel;
}

function selectRecordOrEmptyObject(modelName, id, crud) {
  var record = selectRecord(modelName, id, crud);
  if (record.isLoading || record.error) {
    return {};
  }
  return record;
}

function selectActionStatus(modelName, crud, action) {
  var rawStatus = (crud.getIn([modelName, 'actionStatus', action]) || (0, _immutable.fromJS)({})).toJS();
  var _rawStatus$pending = rawStatus.pending;
  var pending = _rawStatus$pending === undefined ? false : _rawStatus$pending;
  var _rawStatus$id = rawStatus.id;
  var id = _rawStatus$id === undefined ? null : _rawStatus$id;
  var _rawStatus$isSuccess = rawStatus.isSuccess;
  var isSuccess = _rawStatus$isSuccess === undefined ? null : _rawStatus$isSuccess;
  var _rawStatus$payload = rawStatus.payload;
  var payload = _rawStatus$payload === undefined ? null : _rawStatus$payload;


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

function selectNiceActionStatus(modelName, crud, action) {
  // eslint-disable-next-line no-console
  console.warn('This function is deprecated and will be removed in 5.0.0.');
  // eslint-disable-next-line no-console
  console.warn('Please replace it with selectActionStatus, which has the ');
  // eslint-disable-next-line no-console
  console.warn('same functionality.');

  return selectActionStatus(modelName, crud, action);
}