'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

    _classCallCheck(this, ApiClient);

    var baseConfig = {
      bodyEncoder: JSON.stringify,
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

        var config = _extends({}, baseConfig, passedConfig, fetchConfig, {
          headers: _extends({}, baseConfig.headers, passedConfig ? passedConfig.headers : {}, fetchConfig ? fetchConfig.headers : {})
        });

        var _methods = config.methods,
            basePath = config.basePath,
            headers = config.headers,
            format = config.format,
            bodyEncoder = config.bodyEncoder,
            otherConfig = _objectWithoutProperties(config, ['methods', 'basePath', 'headers', 'format', 'bodyEncoder']);

        var requestPath = basePath + path + _this.queryString(params);
        var body = data ? bodyEncoder(data) : undefined;

        return fetch(requestPath, _extends({}, otherConfig, {
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


  _createClass(ApiClient, [{
    key: 'queryString',
    value: function queryString(params) {
      var s = Object.keys(params).map(function (key) {
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