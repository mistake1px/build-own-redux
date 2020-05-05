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

/** 多种状态合并问题 */

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
let initInfoState = {
  name: 'jack',
  desc: 'handsome guy'
}
function InfoReducer (state, action) {
  if (!state) {
    state = initInfoState
  }
  switch (action.type) {
    case 'SET_NAME':
      return {
        ...state,
        name: action.name
      }
    case 'SET_DESC':
      return {
        ...state,
        desc: action.desc
      }
    default:
      return state;
  }
}
// combine 
const reducer = combineReducers({
  counter: counterReducer,
  info: InfoReducer
})

let store = createStore(reducer)

store.subscribe(() => {
  let state = store.getState();
  console.log(state.counter.count, state.info.name, state.info.desc);
})
/*自增*/
store.dispatch({
  type: 'INCREMENT'
});
/*自减*/
store.dispatch({
  type: 'SET_NAME',
  name: 'wanger'
});

