# build-own-redux

## v0.1

在改变状态后，能发出通知，使用发布订阅模式解决该问题。

## v0.2

两个问题：

1. 状态管理器的通用问题，现在只能管理count
2. 公共代码封装
3. 实现getState changeState subscribe

## v0.3

在上面实现的`changeState`中，我们不能限定更该数据的内容，比如我们可以将count修改为
'some string'字符串，这是不合理的。我们需要count按计划去改变：比如自增和自减。所以我们只对外提供两种改变count的方法。（这就是action啊～～）

在这里我们引入`reducer`的概念,reducer可以告诉store，我们要修改的是什么，并按照我们的计划修改。

## v0.4

现在我们面临新的问题：在state中我们可能会有多种状态。如果把所有的计划更改的内容放到一个函数中，将会使这个函数非常庞大且难以维护。我们需要将其拆分开来。这里我们引入`combineReducers`的概念。

贴一下源码：

``` js
function combineReducers(reducers) {
  const keys = Object.keys(reducers)
  return function (state = {}, action) {
    const nextState = {}
    for (let i=0;i<keys.length;i++) {
      const key = keys[i]
      const reducer = reducers[key]
      const prevStateForKey = state[key]
      const nextStateForKey = reducer(prevStateForKey, action)
      nextState[key] = nextStateForKey
    }
    return nextState
  }
}
```

另外需要说明的是：在`createStore`内部，我们注意到`changeState`和`plan`分别对应redux中的`dispatch`和`reducer`。最后我们将其改为`dispatch`和`reducer`。
