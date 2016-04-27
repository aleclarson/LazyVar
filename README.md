
# lazy-var v1.0.0

```coffee
LazyVar = require "lazy-var"

foo = LazyVar -> 1

foo._value # undefined

foo.get()  # 1

foo._value # 1

foo.set 2  # 2

foo._value # 2
```

## install

```sh
npm install aleclarson/lazy-var#1.0.0
```
