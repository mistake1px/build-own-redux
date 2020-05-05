function createStore(initState) {
  let state = initState
  let listeners = []
  // subscribe
  function subscribe(listener) {
    listeners.push(listener)
  }
  // changeState
  function changeState(newState) {
    state = newState
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

/** 管理多个状态 */

let initState = {
  counter: { count: 0 },
  info: { name: '', desc: '' }
}
let store = createStore(initState)
// 订阅info
store.subscribe(() => {
  let state = store.getState()
  console.log(`${state.info.name}: ${state.info.desc}`)
})
// 订阅counter
store.subscribe(() => {
  let state = store.getState()
  console.log(`counter: ${state.counter.count}`)
})
// change info
store.changeState({
  ...store.getState(),
  info: {
    name: 'jack',
    desc: 'handsome guy'
  }
})
// change count
store.changeState({
  ...store.getState(),
  counter: { count: 43 }
})
