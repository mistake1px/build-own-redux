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

## v0.5

上面我们将reducer拆分开了，但是state还是定义在一起的，项目中不同的state分布在不同的地方，定义在一起是不合理的，同时也会增加维护的难度，所以我们需要像拆分reducer一样拆分state。

``` js
let initCounterState = {
  count: 0
}
function counterReducer(state, action) {
  /*注意：如果 state 没有初始值，那就给他初始值！！*/  
  if (!state) {
      state = initState;
  }
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + 1
      }
    default:
      return state;
  }
}
```

同时在`createStore`内部，进行一次不匹配任何类型action的`dispatch`。目的是使每个reducer走到default这一步，从而返回自己初始化的state

``` js
dispatch({ type: Symbol() })
```

## 0.6 middleware

下面说到最难理解的部分`middleware`

我们通过改造dispatch来实现middleware。

``` js
const next = store.dispatch

store.dispatch = action => {
  console.log('this state: ', store.getState())
  console.log('action: ', action)
  next(action)
  console.log('next state: ', store.getState())
}
store.dispatch({
  type: 'INCREMENT'
})
```

### v0.6.1

上面的middleware中，我们只实现了一种middleware，如果有多种的话，该怎么办？
比如说，现在有一个记录异常的middleware：

``` js
const store = createStore(reducer);
const next = store.dispatch;
store.dispatch = (action) => {
  try {
    console.log('success: all ok!')
    next(action);
  } catch (err) {
    console.error('错误报告: ', err)
  }
}
```

我们怎么将上面两种middleware合并起来呢？

按照常规思路，合并两个middleware：

``` js
store.dispatch = action => {
  try {
    // exeception
    console.log('success: all ok!')
    // logger
    console.log('this state: ', store.getState())
    console.log('action: ', action)
    next(action)
    console.log('next state: ', store.getState())
  } catch(e) {
    console.log('err: ', e)
  }
}
```

这种方式只是展示一下怎么将上面两个middleware合并起来，根本没有任何实用性。
我们接下来考虑一下怎么让middleware直接合作？

首先，提取middleware：

``` js
const store = createStore(reducer);
const next = store.dispatch;
const loggerMiddleware = (action) => {
  console.log('this state', store.getState());
  console.log('action', action);
  next(action);
  console.log('next state', store.getState());
}
store.dispatch = (action) => {
  try {
    console.log('success: all ok!')
    loggerMiddleware(action);
  } catch (err) {
    console.error('错误报告: ', err)
  }
}
```

上面我们将`loggerMiddleware`提取出来，然后将其应用到`exceptionMiddleware`中。

接下来我们更进一步，将`exceptionMiddleware`也提取出来：

``` js
const exceptionMiddleware = (action) => {
  try {
    loggerMiddleware(action);
  } catch (err) {
    console.error('错误报告: ', err)
  }
}
store.dispatch = exceptionMiddleware;
```

有一个问题，我们在`exceptionMiddleware`中使用`loggerMiddleware`，但是其中的`next`好像又是最外层的，我们应该将其作为参数传入：

``` js
const loggerMiddleware = next => action => {
  console.log('this state: ', store.getState())
  console.log('action: ', action)
  next(action)
  console.log('next state: ', store.getState())
}
const exceptionMiddleware = next => action => {
  try {
    console.log('success: all ok!')
    next(action)
  } catch (e) {
    console.error('error: ', e)
  }
}
```

使用时，这样调用：

``` js
store.dispatch = exceptionMiddleware(loggerMiddleware(next));
```

如果我们将各种middleware文件写入到单独的文件中呢？这个时候发现`store`没了，所以我们继续添加参数：

``` js
const loggerMiddleware = store => next => action => {
  console.log('this state: ', store.getState())
  console.log('action: ', action)
  next(action)
  console.log('next state: ', store.getState())
}
const exceptionMiddleware = store => next => action => {
  try {
    console.log('success: all ok!')
    next(action)
  } catch (e) {
    console.error('error: ', e)
  }
}
```

使用：

``` js
const exception = exceptionMiddleware(store)
const logger = loggerMiddleware(store)
store.dispatch = exception(logger(next))
```

### v0.6.2

如何像redux那样使用middleware呢？我们知道`middleware`是通过重写dispatch来实现的，而dispatch是在createStore的时候定义的，所以我们要通过`createStore`实现`applyMiddlewares`

想象一下，我们大概这么使用：

``` js
const newCreateStore = applyMiddleware(middleware1, middleware2...)(createStore)
const store = newCreateStore(reducer)
```

代码

``` js
function applyMiddleware(...middlewares) {
  return function rewriteCreateStore(oldCreateStore) {
    return function newCreateStore(reducer, initState) {
      const store = oldCreateStore(reducer, initState)
      const chain = middlewares.map(m => m(store))
      let dispatch = store.dispatch
      chain.reverse().map(m => {
        dispatch = m(dispatch)
      })
      store.dispatch = dispatch
      return store
    }
  }
}
```

使用时，是这样的：

``` js
const rewriteCreateStore = applyMiddleware(
  exceptionMiddleware,
  timeMiddleware,
  loggerMiddleware
)
const store = rewriteCreateStore(createStore)(reducer)
```

显然，这样比较麻烦，对于需不需要middleware需要有两种方式来创建store，更近一步：

``` js
const createStore = (reducer, initState, rewriteCreateStoreFunc) => {
    /*如果有 rewriteCreateStoreFunc，那就采用新的 createStore */
    if(rewriteCreateStoreFunc){
       const newCreateStore =  rewriteCreateStoreFunc(createStore);
       return newCreateStore(reducer, initState);
    }
    /*否则按照正常的流程走*/
    ...
}
```

## v0.7

简单调整：

- 对subscribe提供取消订阅功能
- 引入compose，对applyMiddleware实现时进行优化
- createStore时，对是否传入initState进行判断

## v0.8

将各个功能独立为文件

### v0.8.1

完善createStore，添加`replaceReducer`功能。这里说一下这个功能的作用：使用新的reducer来替代旧的reducer(包括创建store时传入的reducer)

``` js
// replace reducer
function replaceReducer(nextReducer) {
  reducer = nextReducer
  dispatch({ type: Symbol() })
}
```

同样的在这一步中，我们建立reducers文件夹，将所有的reducer统一放在这里。

### v0.8.2

最后一个功能，我们在使用react-redux的时候，经常使用的api：`bindActionCreators`。它允许我们隐藏`dispatch`和`action creator`，就像一个正常的通过props传入的函数属性一样，感受不到redux的存在。

通常我们这样使用：

``` js
const reducer = combineReducers({
  count: counterReducer,
  info: infoReducer
})
const store = createStore(reducer)
// 下面是action creator 方法：
function increment() {
  return { type: 'INCREMENT' }
}
function setName(name) {
  return {
    type: 'SET_NAME',
    name: name
  }
}
const actions = {
  increment: function() {
    return store.dispatch(increment.apply(this, arguments))
  },
  setName: function() {
    return store.dispatch(setName.apply(this, arguments))
  }
}
actions.increment()
actions.setName('kimi')
```

在通过`action creator`生成绑定的方法时，可以通过更统一的方式来简化：

``` js
const actions = bindActionCreators({ increment, setName }, store.dispatch)
```

源码：

```js
// 单个处理
function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(this, arguments))
  }
}
export default function bindActionCreators(actionCreators, dispatch) {
  // 如果只有一个action creator
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch)
  }
  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error()
  }
  const keys = Object.keys(actionCreators)
  const boundActionCreators = {}
  for (let i=0;i<keys.length;i++) {
    const key = keys[i]
    const actionCreator = actionCreators[key]
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
    }
  }
  return boundActionCreators
}
```

## v0.9 总结

首先对各个概念进行总结

- createStore 创建store对象，包含getState, dispatch, subscribe, replaceReducer
- reducer是一个计划函数，接收旧的state和action，生成新的state
- action是一个对象，上面reducer的第二个参数。
- dispatch触发action，生成新的state
- subscribe实现订阅功能，每次dispatch的时候，触发订阅的内容
- combineReducers 将多个reducer组合成一个
- replaceReducer 替换reducer函数
- middleware扩展dispatch函数

![流程图](https://github.com/mistake1px/build-own-redux/blob/master/demo/redux-flow.webp)
