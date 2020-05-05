import compose from './compose.mjs'

export default function applyMiddleware(...middlewares) {
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
