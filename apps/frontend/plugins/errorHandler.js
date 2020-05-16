// const exclude = path => /^\/to-exclude\//.test(path)

// Global handler for apollo errors
export default (error, context) => {
  if ((context && !context.isDev) || process.env.NODE_ENV === 'production') {
    context.app.$sentry.captureException(error)
  } else if (error.graphQLErrors) {
    // if (exclude(context.route.path)) return
    error.graphQLErrors.map(({ message }) => {
      if (message === 'Bad authentication') {
        context.store.dispatch('global/logout')
        context.redirect('/')
      }
      //   console.log(message)
      context.error({ errorCode: 404, message })
    })
  }
}
