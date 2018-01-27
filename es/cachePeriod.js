'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHalfCachePeriod = exports.getCachePeriod = exports.halfCachePeriod = exports.cachePeriod = exports.cachePeriodAgo = undefined;

var _devMessage = require('./devMessage');

var _devMessage2 = _interopRequireDefault(_devMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TEN_MINUTES = 10 * 60 * 1000;

function getCachePeriod() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      showMessages = _ref.showMessages;

  var value = process.env.CACHE_PERIOD || process.env.REACT_APP_CACHE_PERIOD || TEN_MINUTES;
  value = Math.round(value);
  if (isNaN(value)) {
    value = TEN_MINUTES;
    if (showMessages) {
      (0, _devMessage2.default)('getCachePeriod got NaN! Falling back to ten minute cache period');
    }
  }
  if (value < 1000) {
    value = TEN_MINUTES;
    if (showMessages) {
      (0, _devMessage2.default)('getCachePeriod got a value under one second!\n                  Falling back to ten minute cache period');
    }
  }
  return value;
}

function getHalfCachePeriod() {
  var value = process.env.HALF_CACHE_PERIOD || process.env.REACT_APP_HALF_CACHE_PERIOD || getCachePeriod() / 2;
  value = Math.round(value);
  if (isNaN(value)) {
    value = Math.round(getCachePeriod({ showMessages: false }) / 2);
    (0, _devMessage2.default)('getHalfCachePeriod got NaN! Falling back to half of cachePeriod: ' + value);
  }
  if (value < 500) {
    value = Math.round(getCachePeriod({ showMessages: false }) / 2);
    (0, _devMessage2.default)('getHalfCachePeriod got a value under 500ms!\n                Falling back to half of cache period: ' + value);
  }
  return value;
}

var cachePeriod = getCachePeriod();
var halfCachePeriod = getHalfCachePeriod();

function cachePeriodAgo(now) {
  var customCachePeriod = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

  var actualCachePeriod = customCachePeriod || cachePeriod;
  return now - actualCachePeriod;
}

// public
exports.cachePeriodAgo = cachePeriodAgo;
exports.cachePeriod = cachePeriod;
exports.halfCachePeriod = halfCachePeriod;

// only visible for testing

exports.getCachePeriod = getCachePeriod;
exports.getHalfCachePeriod = getHalfCachePeriod;