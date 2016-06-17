
# LazyVar 2.0.0 ![stable](https://img.shields.io/badge/stability-stable-4EBA0F.svg?style=flat)

```coffee
LazyVar = require "lazy-var"

foo = LazyVar -> 1

foo._value # undefined

foo.get()  # 1

foo._value # 1

foo.set 2  # 2

foo._value # 2
```

**TODO:** Write tests?!
