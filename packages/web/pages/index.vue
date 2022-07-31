<template>
  <main>
    <div class="tool-box flex justify-between items-center rounded-lg">
      <ul class="flex m-4 tabs">
        <li class="mr-2">
          <button
            :class="{ active: selectedTab == 'template' }"
            class="py-3 px-4 rounded-lg"
            @click="selectedTab = 'template'"
          >
            Scraping template
          </button>
        </li>
        <li class="mr-2">
          <button
            :class="{ active: selectedTab == 'data' }"
            class="py-3 px-4 rounded-lg"
            @click="selectedTab = 'data'"
          >
            Scraping data
          </button>
        </li>
      </ul>

      <button class="scrap-btn mr-5 py-3 px-4 rounded-lg">Start Scraping</button>
    </div>
    <div class="panels">
      <div v-if="selectedTab == 'template'">
        <p class="text-lg mb-5">Scrapito template:</p>
        <Editor v-model="scrapitoTemplate" lang="yaml" />
      </div>
      <div v-else-if="selectedTab == 'data'">
        <p class="text-lg mb-5">Load HTML from url:</p>
        <input type="text" />
        <p class="text-lg mb-5">HTML to parse:</p>
        <Editor v-model="codeHtml" lang="html" />
      </div>
      <div>
        <p class="text-lg mb-5">Scrapping results:</p>
        <Editor v-model="code" title="Result" readonly lang="json" />
      </div>
    </div>
  </main>
</template>

<script>
export default {
  data() {
    return {
      codeHtml: '',
      scrapitoTemplate: '',
      code: '',
      selectedTab: 'template',
    }
  },
}
</script>

<style lang="scss" scoped>
.panels {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: flex-start;
}

.tabs {
  li button {
    font-weight: 700;
    transition: background 0.3s ease;

    &:hover {
      background-color: rgba($color: #5900ff, $alpha: 0.5);
    }

    &.active {
      background-color: #5900ff;
    }
  }
}

.tool-box {
  border: solid 1px $secondary-bg;
  margin: 15px;
}

.scrap-btn {
  color: $primary-bg;
  outline: none;
  font-weight: 700;
  transition: background 0.3s ease;
  background-color: #42ffa4;

  &:active {
    background-color: #159959;
  }
}

@media screen and (max-width: 1200px) {
  .panels {
    flex-direction: column;
  }
}
</style>
