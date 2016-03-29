var LazyVar, NamedFunction, ReactiveVar, Tracker, _makeNonReactive, setType;

NamedFunction = require("named-function");

ReactiveVar = require("reactive-var");

setType = require("set-type");

Tracker = require("tracker");

module.exports = LazyVar = NamedFunction("LazyVar", function(options) {
  var initValue, reactive, self;
  if (options instanceof Function) {
    options = {
      initValue: options
    };
  }
  if ((options != null ? options.constructor : void 0) !== Object) {
    throw TypeError("LazyVar only accepts a Function or Object!");
  }
  initValue = options.initValue, reactive = options.reactive;
  if (reactive) {
    initValue = _makeNonReactive(initValue);
  }
  self = {
    get: function() {
      return self._impl.get.call(self, initValue, this);
    },
    set: function(newValue) {
      return self._impl.set.call(self, newValue);
    }
  };
  Object.defineProperty(self, "_value", {
    value: reactive ? ReactiveVar() : void 0,
    writable: true,
    enumerable: false
  });
  return setType(self, LazyVar);
});

LazyVar.prototype.reset = function() {
  if (this._impl === this._initialImpl) {
    return;
  }
  this._value = this._isReactive() ? ReactiveVar() : void 0;
  delete this._impl;
};

LazyVar.prototype._isReactive = function() {
  var ref;
  return ((ref = this._value) != null ? ref.constructor : void 0) === ReactiveVar;
};

LazyVar.prototype._initialImpl = {
  get: function(initValue, scope) {
    var initialValue, isReactive;
    isReactive = this._isReactive();
    this._overrideImpl(isReactive ? this._reactiveImpl : this._defaultImpl);
    initialValue = initValue.call(scope);
    this.set(initialValue);
    return initialValue;
  },
  set: function(newValue) {
    this._overrideImpl(this._isReactive() ? this._reactiveImpl : this._defaultImpl);
    return this.set(newValue);
  }
};

LazyVar.prototype._defaultImpl = {
  get: function() {
    return this._value;
  },
  set: function(newValue) {
    this._value = newValue;
  }
};

LazyVar.prototype._reactiveImpl = {
  get: function() {
    return this._value.get();
  },
  set: function(newValue) {
    return this._value.set(newValue);
  }
};

LazyVar.prototype._impl = LazyVar.prototype._initialImpl;

LazyVar.prototype._overrideImpl = function(impl) {
  return Object.defineProperty(this, "_impl", {
    value: impl,
    enumerable: false,
    configurable: true
  });
};

_makeNonReactive = function(initValue) {
  return function() {
    return Tracker.nonreactive((function(_this) {
      return function() {
        return initValue.call(_this);
      };
    })(this));
  };
};

//# sourceMappingURL=../../map/src/LazyVar.map
