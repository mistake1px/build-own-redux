import applyMiddleware from './applyMiddleware.mjs'
import combineReducers from './combineReducers.mjs'
import loggerMiddleware from './middlewares/loggerMiddleware.mjs'
import exceptionMiddleware from './middlewares/exceptionMiddleware.mjs'
import timeMiddleware from './middlewares/timeMiddleware.mjs'
import createStore from './createStore.mjs'

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
const reducer = combineReducers({
  count: counterReducer
})
// 
const rewriteCreateStore = applyMiddleware(
  exceptionMiddleware,
  timeMiddleware,
  loggerMiddleware
)
const store = createStore(reducer, rewriteCreateStore)

store.dispatch({
  type: 'INCREMENT'
})