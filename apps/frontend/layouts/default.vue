<template>
  <div id="container" :class="{'dark-theme': !pastelTheme, 'pastel-theme': pastelTheme}">
    <svg-icon v-if="pastelTheme" id="theme-switcher" name="halloween" @click="pastelTheme = false" />
    <svg-icon v-else id="theme-switcher" name="moon" @click="pastelTheme = true" />
    <nuxt />
  </div>
</template>

<script>
export default {
  data: () => ({
    pastelTheme: false
  })
}
</script>

<style lang="scss" scoped>
  #theme-switcher {
    position: absolute;
    right: 0;
    height: 32px;
    width: 32px;
    margin: 10px;
  }
</style>
