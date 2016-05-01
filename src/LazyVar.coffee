
{ assert, isType } = require "type-utils"

ReactiveVar = require "reactive-var"
Tracker = require "tracker"
Type = require "Type"

# TODO: Inject self into 'Property' class.

type = Type "LazyVar"

type.createArguments (args) ->

  if args[0] instanceof Function
    args[0] = createValue: args[0]

  assert isType(args[0], Object),
    reason: "LazyVar only accepts a Function or Object!"

  # We don't want a Reaction to depend on the variables
  # referenced in the lazy computation! We only want to
  # depend on the ReactiveVar that holds the lazy result!
  wrapNonReactive args[0], "createValue" if args[0].reactive

  return args

type.optionTypes =
  createValue: Function
  reactive: Boolean.Maybe

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

type.initInstance ->
  @_resetValue()

type.defineProperties

  hasValue: get: ->
    @_get isnt @_firstGet

type.defineMethods

  reset: ->
    return if @_get is @_firstGet
    @_resetValue()
    delete @_get
    return

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

module.exports = type.build()

wrapNonReactive = (obj, key) ->
  func = obj[key]
  obj[key] = ->
    scope = this
    Tracker.nonreactive ->
      func.call scope
