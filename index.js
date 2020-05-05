function plan(state, action) {
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

function createStore(plan, initState) {
  let state = initState
  let listeners = []
  // subscribe
  function subscribe(listener) {
    listeners.push(listener)
  }
  // changeState
  function changeState(action) {
    state = plan(state, action)
    for (let l of listeners) {
      l()
    }
  }
  // getState
  function getState() {
    return state
  }
  return { subscribe, getState, changeState }
}

/** 按计划改变状态 */

let initState = {
  count: 0
}
let store = createStore(plan, initState)

store.subscribe(() => {
  let state = store.getState()
  console.log(`counte: ${state.count}`)
})
/*自增*/
store.changeState({
  type: 'INCREMENT'
});
/*自减*/
store.changeState({
  type: 'DECREMENT'
});
/*我想随便改 计划外的修改是无效的！仍然返回0*/
store.changeState({
  count: 'abc'
});
