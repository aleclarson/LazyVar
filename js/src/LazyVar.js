var ReactiveVar, Tracker, Type, assert, isType, type, wrapNonReactive;

ReactiveVar = require("reactive-var");

Tracker = require("tracker");

isType = require("isType");

assert = require("assert");

Type = require("Type");

type = Type("LazyVar");

type.optionTypes = {
  createValue: Function,
  reactive: Boolean.Maybe
};

type.createArguments(function(args) {
  if (args[0] instanceof Function) {
    args[0] = {
      createValue: args[0]
    };
  }
  assert(isType(args[0], Object), {
    reason: "LazyVar only accepts a Function or Object!"
  });
  if (args[0].reactive) {
    wrapNonReactive(args[0], "createValue");
  }
  return args;
});

type.defineFrozenValues(function(arg) {
  var createValue, self;
  createValue = arg.createValue;
  self = this;
  return {
    get: function() {
      return self._get(createValue, this);
    },
    set: function(newValue) {
      return self._set(newValue);
    }
  };
});

type.defineValues({
  _value: null,
  _reactive: function(options) {
    return options.reactive;
  },
  _get: function() {
    return this._firstGet;
  },
  _set: function() {
    return this._firstSet;
  }
});

type.defineProperties({
  hasValue: {
    get: function() {
      return this._get !== this._firstGet;
    }
  }
});

type.defineMethods({
  reset: function() {
    if (this._get === this._firstGet) {
      return;
    }
    this._resetValue();
    delete this._get;
  },
  _resetValue: function() {
    return this._value = this._reactive ? ReactiveVar() : void 0;
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

type.initInstance(function() {
  return this._resetValue();
});

type.didBuild(function(type) {
  var Property;
  Property = require("Property");
  return Property.inject.LazyVar(type);
});

module.exports = type.build();

wrapNonReactive = function(obj, key) {
  var func;
  func = obj[key];
  return obj[key] = function() {
    var scope;
    scope = this;
    return Tracker.nonreactive(function() {
      return func.call(scope);
    });
  };
};

//# sourceMappingURL=../../map/src/LazyVar.map
