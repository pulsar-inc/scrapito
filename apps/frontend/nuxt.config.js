const title = 'Nuxt Boilerplate'
const description = 'Nuxt Boilerplate from Pulsar'
const image = 'https://i.ibb.co/DGC57H8/pinkpeach.png'

export default {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'og:title', property: 'og:title', content: title },
      { hid: 'description', name: 'description', content: description },
      { hid: 'og:desc', property: 'og:description', content: description },
      { hid: 'og:image', property: 'og:image', content: image },
      { name: 'theme-color', content: '#ffffff' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { name: 'msapplication-TileColor', content: '#2b5797' },
      { rel: 'shortcut icon', type: 'image/png', href: '/logo.png' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Muli:wght@300;400;600;700&display=swap' },
      { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#5bbad5' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
    ]
  },
  /*
  ** Global CSS
  */
  css: ['@/assets/scss/global.scss'],
  styleResources: {
    scss: ['@/assets/scss/variables.scss']
  },
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxtjs/eslint-module'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/pwa',
    '@nuxtjs/dotenv',
    '@nuxtjs/sentry',
    '@nuxtjs/apollo',
    '@nuxtjs/svg-sprite',
    '@nuxtjs/style-resources'
  ],
  /*
  ** Sentry config
  */
  sentry: {
    dsn: process.env.NODE_ENV !== 'development' ? process.env.SENTRY_DSN : null,
    config: {
      release: process.env.npm_package_name
    }
  },
  /*
  ** PWA config
  */
  pwa: {
    manifest: {
      name: 'Boilerplate',
      short_name: 'Boilerplate',
      display: 'standalone',
      theme_color: '#17171E',
      background_color: '#17171E'
    },
    icon: {
      iconSrc: '~/static/logo.png',
      iconFileName: 'logo.png'
    }
  },
  /*
  ** SVG sprite config
  */
  svgSprite: {
    input: '~/assets/svg/',
    output: '~/assets/gen'
  },
  /*
  ** Apollo config
  */
  apollo: {
    tokenName: 'token',
    authenticationType: '',
    errorHandler: '~/plugins/errorHandler.js',
    clientConfigs: {
      default: '~/plugins/apollo-config.js'
    }
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  }
}
