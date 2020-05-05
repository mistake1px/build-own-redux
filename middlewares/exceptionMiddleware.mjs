export default store => next => action => {
  try {
    console.log('success: all ok!')
    next(action)
  } catch (e) {
    console.error('error: ', e)
  }
}