'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This class is a reference implementation. If you desire additional
// functionality, you can work with the config options here, or copy this code
// into your project and customize the ApiClient to your needs.

// You can pass in config using `action.payload.fetchConfig`, or using passedConfig
// when you first initialize your ApiClient. Some keys will be used internally, and
// all other config keys will be passed on to the fetch `init` parameter. See
// https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch for details.
//
// See below for how the three config objects are merged: fetchConfig takes precedence
// over passedConfig, which takes precedence over baseConfig. The headers key of
// the three objects is merged, to allow more fine-grained header setup.
//
// `methods` will be ignored if passed to fetchConfig. Pass an array to passedConfig
// to allow more HTTP methods to be used via the fetch API.
//
// `basePath` is the basePath of your API. It must be passed to passedConfig, and can
// be overwritten in fetchConfig.
//
// `format` is the format to be requested from the Response. It can be any of arrayBuffer,
// blob, formData, json (the default), or text.
//
// `bodyEncoder` is the function that encodes the data parameter before passing to fetch
//
// All other keys are passed directly to the fetch `init` parameter.

var ApiClient = function () {
  function ApiClient(passedConfig) {
    var _this = this;

    (0, _classCallCheck3.default)(this, ApiClient);

    var baseConfig = {
      bodyEncoder: _stringify2.default,
      credentials: 'same-origin',
      format: 'json',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      methods: ['get', 'post', 'put', 'patch', 'delete']
    };

    if (!passedConfig.basePath) {
      // e.g. 'https://example.com/api/v3'
      throw new Error('You must pass a base path to the ApiClient');
    }

    var methods = passedConfig.methods || baseConfig.methods;
    methods.forEach(function (method) {
      _this[method] = function (path) {
        var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            params = _ref.params,
            data = _ref.data,
            fetchConfig = _ref.fetchConfig;

        var config = (0, _extends3.default)({}, baseConfig, passedConfig, fetchConfig, {
          headers: (0, _extends3.default)({}, baseConfig.headers, passedConfig ? passedConfig.headers : {}, fetchConfig ? fetchConfig.headers : {})
        });
        var _methods = config.methods,
            basePath = config.basePath,
            headers = config.headers,
            format = config.format,
            bodyEncoder = config.bodyEncoder,
            otherConfig = (0, _objectWithoutProperties3.default)(config, ['methods', 'basePath', 'headers', 'format', 'bodyEncoder']);

        var requestPath = basePath + path + _this.queryString(params);
        var body = data ? bodyEncoder(data) : undefined;

        return fetch(requestPath, (0, _extends3.default)({}, otherConfig, {
          method: method,
          headers: headers,
          body: body
        })).then(function (response) {
          return { response: response, format: format };
        }).then(_this.handleErrors).then(function (response) {
          return response[format]();
        });
      };
    });
  }

  // thanks http://stackoverflow.com/a/12040639/5332286


  (0, _createClass3.default)(ApiClient, [{
    key: 'queryString',
    value: function queryString(params) {
      var s = (0, _keys2.default)(params).map(function (key) {
        return [key, params[key]].map(encodeURIComponent).join('=');
      }).join('&');
      return s ? '?' + s : '';
    }
  }, {
    key: 'handleErrors',
    value: function handleErrors(_ref2) {
      var response = _ref2.response,
          format = _ref2.format;

      if (!response.ok) {
        return response[format]()
        // if response parsing failed send back the entire response object
        .catch(function () {
          throw response;
        })
        // else send back the parsed error
        .then(function (parsedErr) {
          throw parsedErr;
        });
      }
      return response;
    }
  }]);
  return ApiClient;
}();

exports.default = ApiClient;