import { InMemoryCache } from 'apollo-cache-inmemory'

export default () => {
  const cache = new InMemoryCache()

  return {
    httpEndpoint: process.env.DEFAULT_ENDPOINT || '',
    auhentificationType: '',
    queryDeduplication: true,
    defaultHttpLink: false,
    cache
  }
}
