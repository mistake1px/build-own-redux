let initCounterState = {
  count: 0
}
export default function counterReducer (state, action) {
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