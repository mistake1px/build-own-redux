export default store => next => action => {
  console.log('time: ', +new Date())
  next(action)
}
