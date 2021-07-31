<template>
  <div class="container">
    <div>
      <Logo />
      <h1 class="title">scrapito-frontend</h1>
      <div class="links">
        <button rel="noopener noreferrer" class="button--green" @click="scrap">Scrap</button>
      </div>
    </div>
  </div>
</template>

<script>
import { Scrapito } from '@scrapito/core'

export default {
  methods: {
    async scrap() {
      const s = new Scrapito({
        name: 'dede',
        version: 1,
        timeout: 2000,
        start: 'first',
        pipelines: [
          {
            url: 'http://localhost:3000/links',
            name: 'all-links',
            selector: 'a',
            next: [
              {
                name: 'extract-hrefs',
                selector: '*',
                attribute: 'href',
              },
            ],
          },
        ],
      })
      console.log(s)
      const res = await s.scrap()
      console.log(res)
    },
  },
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
