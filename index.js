let state = {
  count: 1
}
let listeners = []
function subscribe(listener) {
  listeners.push(listener)
}

function changeCount(count) {
  state.count = count
  for (let l of listeners) {
    l()
  }
}

/** use it */

subscribe(() => {
  console.log(state.count)
})
changeCount(2)
changeCount(3)
changeCount(4)
