var LazyVar, NamedFunction, ReactiveVar, Tracker, _makeNonReactive, setType;

NamedFunction = require("NamedFunction");

ReactiveVar = require("reactive-var");

Tracker = require("tracker");

setType = require("setType");

module.exports = LazyVar = NamedFunction("LazyVar", function(options) {
  var createValue, reactive, self;
  if (options instanceof Function) {
    options = {
      createValue: options
    };
  }
  if ((options != null ? options.constructor : void 0) !== Object) {
    throw TypeError("LazyVar only accepts a Function or Object!");
  }
  createValue = options.createValue, reactive = options.reactive;
  if (reactive) {
    createValue = _makeNonReactive(createValue);
  }
  if (!(createValue instanceof Function)) {
    throw Error("'createValue' must be a Function!");
  }
  self = {
    get: function() {
      return self._impl.get.call(self, createValue, this);
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

Object.defineProperty(LazyVar.prototype, "hasValue", {
  get: function() {
    return this._impl !== this._initialImpl;
  },
  enumerable: true
});

LazyVar.prototype.reset = function() {
  if (!this.hasValue) {
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
  get: function(createValue, scope) {
    var isReactive, newValue;
    isReactive = this._isReactive();
    this._overrideImpl(isReactive ? this._reactiveImpl : this._defaultImpl);
    newValue = createValue.call(scope);
    this.set(newValue);
    return newValue;
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

_makeNonReactive = function(createValue) {
  return function() {
    return Tracker.nonreactive((function(_this) {
      return function() {
        return createValue.call(_this);
      };
    })(this));
  };
};

//# sourceMappingURL=../../map/src/LazyVar.map
