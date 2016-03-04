
NamedFunction = require "named-function"
internalize = require "internalize"
setType = require "set-type"

LazyVar = NamedFunction "LazyVar", (firstGet) ->

  self =

    # Initializes the value and replaces itself on the first call.
    get: ->
      self.get = -> self._value
      self.set = (newValue) -> self._value = newValue
      self._value = firstGet.call this

    set: (newValue) ->
      self.get = -> self._value
      self.set = (newValue) -> self._value = newValue
      self._value = newValue

  internalize self,

    _value: undefined

  setType self, LazyVar

module.exports = LazyVar
