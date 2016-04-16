
NamedFunction = require "NamedFunction"
ReactiveVar = require "reactive-var"
Tracker = require "tracker"
setType = require "setType"

module.exports =
LazyVar = NamedFunction "LazyVar", (options) ->

  if options instanceof Function
    options = { initValue: options }

  unless options?.constructor is Object
    throw TypeError "LazyVar only accepts a Function or Object!"

  { initValue, reactive } = options

  # We don't want a Reaction to depend on the variables
  # referenced in the lazy computation! We only want to
  # depend on the ReactiveVar that holds the lazy result!
  initValue = _makeNonReactive initValue if reactive

  self =
    get: -> self._impl.get.call self, initValue, this
    set: (newValue) -> self._impl.set.call self, newValue

  Object.defineProperty self, "_value",
    value: if reactive then ReactiveVar() else undefined
    writable: yes
    enumerable: no

  setType self, LazyVar

Object.defineProperty LazyVar.prototype, "hasValue",
  get: -> @_impl isnt @_initialImpl
  enumerable: yes

LazyVar::reset = ->
  return unless @hasValue
  @_value = if @_isReactive() then ReactiveVar() else undefined
  delete @_impl
  return

LazyVar::_isReactive = ->
  @_value?.constructor is ReactiveVar

LazyVar::_initialImpl =
  get: (initValue, scope) ->
    isReactive = @_isReactive()
    @_overrideImpl if isReactive then @_reactiveImpl else @_defaultImpl
    initialValue = initValue.call scope
    @set initialValue
    return initialValue
  set: (newValue) ->
    @_overrideImpl if @_isReactive() then @_reactiveImpl else @_defaultImpl
    @set newValue

LazyVar::_defaultImpl =
  get: -> @_value
  set: (newValue) ->
    @_value = newValue
    return

LazyVar::_reactiveImpl =
  get: -> @_value.get()
  set: (newValue) ->
    @_value.set newValue

LazyVar::_impl = LazyVar::_initialImpl

LazyVar::_overrideImpl = (impl) ->
  Object.defineProperty this, "_impl",
    value: impl
    enumerable: no
    configurable: yes

_makeNonReactive = (initValue) ->
  return -> Tracker.nonreactive => initValue.call this
