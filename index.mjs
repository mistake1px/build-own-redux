import applyMiddleware from './applyMiddleware.mjs'
import combineReducers from './combineReducers.mjs'
import loggerMiddleware from './middlewares/loggerMiddleware.mjs'
import exceptionMiddleware from './middlewares/exceptionMiddleware.mjs'
import timeMiddleware from './middlewares/timeMiddleware.mjs'

import counterReducer from './reducers/couterReducer.mjs'
import infoReducer from './reducers/infoReducer.mjs'
import createStore from './createStore.mjs'
import bindActionCreators from './bindActionCreators.mjs'

const reducer = combineReducers({
  count: counterReducer
})
const rewriteCreateStore = applyMiddleware(
  exceptionMiddleware,
  timeMiddleware,
  loggerMiddleware
)
const store = createStore(reducer, rewriteCreateStore)
const nextReducer = combineReducers({
  count: counterReducer,
  info: infoReducer
})
store.replaceReducer(nextReducer)

// store.dispatch({
//   type: 'INCREMENT'
// })
// store.dispatch({
//   type: 'SET_NAME',
//   name: 'kenan'
// })
function increment() {
  return { type: 'INCREMENT' }
}
function setName(name) {
  return {
    type: 'SET_NAME',
    name: name
  }
}
// const actions = {
//   increment: function() {
//     return store.dispatch(increment.apply(this, arguments))
//   },
//   setName: function() {
//     return store.dispatch(setName.apply(this, arguments))
//   }
// }
// actions.increment()
// actions.setName('kimi')
const boundActions = bindActionCreators({ increment, setName }, store.dispatch)
console.log(boundActions)
boundActions.increment()
boundActions.setName('kimi')