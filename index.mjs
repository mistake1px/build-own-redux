import compose from './compose.mjs'

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
function applyMiddleware(...middlewares) {
  return function rewriteCreateStore(oldCreateStore) {
    return function newCreateStore(reducer, initState) {
      const store = oldCreateStore(reducer, initState)
      const simpleStore = { getState: store.getState }
      const chain = middlewares.map(m => m(simpleStore))
      let dispatch = compose(...chain)(store.dispatch)
      store.dispatch = dispatch
      return store
    }
  }
}
function createStore(reducer, initState, rewriteCreateStore) {
  // 如果initState是函数，证明没传入initstate
  if (typeof initState === 'function') {
    rewriteCreateStore = initState
    initState = undefined
  }
  if (rewriteCreateStore) {
    const newCreateStore = rewriteCreateStore(createStore)
    return newCreateStore(reducer, initState)
  }
  let state = initState
  let listeners = []
  // subscribe
  function subscribe(listener) {
    listeners.push(listener)
    return function unsubscribe() {
      const index = listeners.indexOf(listener)
      listeners.splice(index, 1)
    }
  }
  // changeState
  function dispatch(action) {
    state = reducer(state, action)
    for (let l of listeners) {
      l()
    }
  }
  // getState
  function getState() {
    return state
  }
  dispatch({ type: Symbol() })
  return { subscribe, getState, dispatch }
}

/** apply middleware */

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
const timeMiddleware = store => next => action => {
  console.log('time: ', +new Date())
  next(action)
}
let initCounterState = {
  count: 0
}
function counterReducer (state, action) {
  if (!state) {
    state = initCounterState
  }
  switch(action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + 1
      }
    case 'DECREMENT':
      return {
        ...state,
        count: state.count - 1
      }
    default:
      return state
  }
}
const reducer = counterReducer
// 
const rewriteCreateStore = applyMiddleware(
  exceptionMiddleware,
  timeMiddleware,
  loggerMiddleware
)
// const store = rewriteCreateStore(createStore)(reducer)
const store = createStore(reducer, rewriteCreateStore)

store.dispatch({
  type: 'INCREMENT'
})