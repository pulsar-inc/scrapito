# nuxt-boilerplate

> Nuxt PWA GraphQL boilerplate

## Plugins

- `@nuxtjs/svg-sprite` [NPM](http://npmjs.com/package/@nuxtjs/svg-sprite)
- `@nuxtjs/apollo` [NPM](http://npmjs.com/package/@nuxtjs/apollo)
- `@nuxtjs/dotenv` [NPM](http://npmjs.com/package/@nuxtjs/dotenv)
- `@nuxtjs/pwa` [NPM](http://npmjs.com/package/@nuxtjs/pwa)

### Developement

- `@nuxtjs/style-resources` [NPM](http://npmjs.com/package/@nuxtjs/style-resources)
- `sass-loader` [NPM](http://npmjs.com/package/sass-loader)
- `node-sass` [NPM](http://npmjs.com/package/node-sass)
- `husky` [NPM](http://npmjs.com/package/husky)

### Visual Studio Code

- `kumar-harsh.graphql-for-vscode` [EXT](https://marketplace.visualstudio.com/items?itemName=kumar-harsh.graphql-for-vscode)
- `dbaeumer.vscode-eslint` [EXT](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- `prisma.vscode-graphql` [EXT](https://marketplace.visualstudio.com/items?itemName=prisma.vscode-graphql)
- `mrmlnc.vscode-scss` [EXT](https://marketplace.visualstudio.com/items?itemName=mrmlnc.vscode-scss)
- `octref.vetur` [EXT](https://marketplace.visualstudio.com/items?itemName=octref.vetur)

## Environment variables

- `DEFAULT_ENDPOINT` ('' by default) GraphQL endpoint url
- `SENTRY_DSN` (undefined by default) Sentry DSN

## Commit linting

By default commits messages must be prefixed by one of these keyword

```
[ADD]
[FIX] or [FIX #1]
[TEST]
[MERGE]
[UPDATE]
[REMOVE] or [DELETE]
[FEATURE]
```

## Configuration

Style can be configured via [main.scss](assets/scss/main.scss) variables.

Commit linting can be changed in [.linter/commit.py](.linter/commit.py).

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at 0.0.0.0:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
