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

function createStore(reducer, initState) {
  let state = initState
  let listeners = []
  // subscribe
  function subscribe(listener) {
    listeners.push(listener)
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

/** middleware */

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

const store = createStore(reducer)

const next = store.dispatch

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
const exception = exceptionMiddleware(store)
const logger = loggerMiddleware(store)
const time = timeMiddleware(store)
store.dispatch = exception(time(logger(next)))

store.dispatch({
  type: 'INCREMENT'
})