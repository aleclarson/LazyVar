var LazyVar, NamedFunction, internalize, setType;

NamedFunction = require("named-function");

internalize = require("internalize");

setType = require("set-type");

LazyVar = NamedFunction("LazyVar", function(firstGet) {
  var self;
  self = {
    get: function() {
      self.get = function() {
        return self._value;
      };
      self.set = function(newValue) {
        return self._value = newValue;
      };
      return self._value = firstGet.call(this);
    },
    set: function(newValue) {
      self.get = function() {
        return self._value;
      };
      self.set = function(newValue) {
        return self._value = newValue;
      };
      return self._value = newValue;
    }
  };
  internalize(self, {
    _value: void 0
  });
  return setType(self, LazyVar);
});

module.exports = LazyVar;

//# sourceMappingURL=../../map/src/LazyVar.map
