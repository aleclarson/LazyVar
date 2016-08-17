var ReactiveVar, Tracker, Type, assert, isType, type;

ReactiveVar = require("ReactiveVar");

Tracker = require("tracker");

isType = require("isType");

assert = require("assert");

Type = require("Type");

type = Type("LazyVar");

type.initArgs(function(args) {
  if (isType(args[0], Function)) {
    args[0] = {
      createValue: args[0]
    };
  }
});

type.defineOptions({
  createValue: Function.isRequired,
  reactive: Boolean
});

type.initInstance(function(options) {
  var createValue, reactive;
  createValue = options.createValue, reactive = options.reactive;
  reactive && (options.createValue = function() {
    return Tracker.nonreactive(this, createValue);
  });
});

type.defineFrozenValues(function(options) {
  var createValue, lazy;
  createValue = options.createValue;
  lazy = this;
  return {
    get: function() {
      return lazy._get(createValue, this);
    },
    set: function(newValue) {
      return lazy._set(newValue);
    }
  };
});

type.defineValues(function(options) {
  return {
    _value: null,
    _reactive: options.reactive,
    _get: this._firstGet,
    _set: this._firstSet
  };
});

type.initInstance(function() {
  return this._resetValue();
});

type.defineGetters({
  hasValue: function() {
    return this._get !== this._firstGet;
  }
});

type.defineMethods({
  reset: function() {
    if (this._get === this._firstGet) {
      return;
    }
    this._resetValue();
    this._get = this._firstGet;
    this._set = this._firstSet;
  },
  call: function(arg1, arg2, arg3) {
    return this.get()(arg1, arg2, arg3);
  },
  _resetValue: function() {
    this._value = this._reactive ? ReactiveVar() : void 0;
  },
  _firstGet: function(createValue, scope) {
    var newValue;
    this._get = this._reactive ? this._reactiveGet : this._simpleGet;
    this._set = this._reactive ? this._reactiveSet : this._simpleSet;
    newValue = createValue.call(scope);
    this._set(newValue);
    return newValue;
  },
  _simpleGet: function() {
    return this._value;
  },
  _reactiveGet: function() {
    return this._value.get();
  },
  _firstSet: function(newValue) {
    this._get = this._reactive ? this._reactiveGet : this._simpleGet;
    this._set = this._reactive ? this._reactiveSet : this._simpleSet;
    return this._set(newValue);
  },
  _simpleSet: function(newValue) {
    return this._value = newValue;
  },
  _reactiveSet: function(newValue) {
    return this._value.set(newValue);
  }
});

module.exports = type.build();

//# sourceMappingURL=map/LazyVar.map
