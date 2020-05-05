export default function createStore(reducer, initState, rewriteCreateStore) {
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
  // replace reducer
  function replaceReducer(nextReducer) {
    reducer = nextReducer
    dispatch({ type: Symbol() })
  }
  dispatch({ type: Symbol() })
  return { subscribe, getState, dispatch, replaceReducer }
}