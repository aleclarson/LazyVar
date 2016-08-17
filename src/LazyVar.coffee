
ReactiveVar = require "ReactiveVar"
Tracker = require "tracker"
isType = require "isType"
assert = require "assert"
Type = require "Type"

type = Type "LazyVar"

type.initArgs (args) ->
  if isType args[0], Function
    args[0] = createValue: args[0]
  return

type.defineOptions
  createValue: Function.isRequired
  reactive: Boolean

# Make 'createValue' non-reactive if '_value' is reactive.
type.initInstance (options) ->
  {createValue, reactive} = options
  reactive and options.createValue = ->
    Tracker.nonreactive this, createValue
  return

type.defineFrozenValues (options) ->
  {createValue} = options
  lazy = this

  get: -> lazy._get createValue, this

  set: (newValue) -> lazy._set newValue

type.defineValues (options) ->

  _value: null

  _reactive: options.reactive

  _get: @_firstGet

  _set: @_firstSet

type.initInstance ->
  @_resetValue()

type.defineGetters

  hasValue: -> @_get isnt @_firstGet

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
    @_value =
      if @_reactive then ReactiveVar()
      else undefined
    return

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
