
ReactiveVar = require "ReactiveVar"
Tracker = require "tracker"
isType = require "isType"
assert = require "assert"
Type = require "Type"

type = Type "LazyVar"

type.defineOptions
  createValue: Function.isRequired
  reactive: Boolean

type.createArguments (args) ->

  if args[0] instanceof Function
    args[0] = createValue: args[0]

  assert isType(args[0], Object), "LazyVar only accepts a Function or Object!"

  # We don't want a Reaction to depend on the variables
  # referenced in the lazy computation! We only want to
  # depend on the ReactiveVar that holds the lazy result!
  args[0].reactive and wrapNonReactive args[0], "createValue"

  return args

type.defineFrozenValues ({ createValue }) ->

  self = this

  get: ->
    self._get createValue, this

  set: (newValue) ->
    self._set newValue

type.defineValues

  _value: null

  _reactive: (options) -> options.reactive

  _get: -> @_firstGet

  _set: -> @_firstSet

type.defineGetters

  hasValue: ->
    @_get isnt @_firstGet

type.defineMethods

  reset: ->
    return if @_get is @_firstGet
    @_resetValue()
    @_get = @_firstGet
    @_set = @_firstSet
    return

  call: (arg1, arg2, arg3) ->
    @get() arg1, arg2, arg3

  _resetValue: ->
    @_value = if @_reactive
      ReactiveVar()
    else undefined

  _firstGet: (createValue, scope) ->
    @_get = if @_reactive then @_reactiveGet else @_simpleGet
    @_set = if @_reactive then @_reactiveSet else @_simpleSet
    newValue = createValue.call scope
    @_set newValue
    return newValue

  _simpleGet: ->
    return @_value

  _reactiveGet: ->
    return @_value.get()

  _firstSet: (newValue) ->
    @_get = if @_reactive then @_reactiveGet else @_simpleGet
    @_set = if @_reactive then @_reactiveSet else @_simpleSet
    @_set newValue

  _simpleSet: (newValue) ->
    @_value = newValue

  _reactiveSet: (newValue) ->
    @_value.set newValue

type.initInstance ->
  @_resetValue()

module.exports = type.build()

wrapNonReactive = (obj, key) ->
  func = obj[key]
  obj[key] = ->
    scope = this
    Tracker.nonreactive ->
      func.call scope
