<template>
  <div class="container">
    <div>
      <logo />
      <h1 class="title">
        nuxt-boilerplate
      </h1>
      <h2 class="subtitle">
        My slick Nuxt.js project
      </h2>
    </div>
  </div>
</template>

<script>
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  }
}
</script>

<style lang="scss">
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: $bg;
}

.title {
  display: block;
  font-weight: 400;
  font-size: 6em;
  letter-spacing: 1px;
  color: $green-1;
}

.subtitle {
  font-weight: 300;
  font-size: 2.5em;
  color: $green-2;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
