<template>
  <div class="editor-container">
    <client-only>
      <PrismEditor
        :value="value"
        class="my-editor language-json"
        :highlight="highlighter"
        line-numbers
        :readonly="readonly"
        @input="$emit('input', $event)"
      />
    </client-only>
  </div>
</template>

<script>
import { PrismEditor } from 'vue-prism-editor'
import 'vue-prism-editor/dist/prismeditor.min.css'
import { highlight, languages } from 'prismjs/components/prism-core'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-markup'
import 'prism-themes/themes/prism-one-dark.css'

export default {
  components: {
    PrismEditor,
  },
  props: {
    value: {
      type: String,
      required: true,
    },
    lang: {
      type: String,
      required: true,
      validator: (x) => ['html', 'json', 'yaml'].includes(x),
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    highlighter(code) {
      return highlight(code, languages[this.lang])
    },
  },
}
</script>

<style lang="scss">
.editor-container {
  background: $primary-bg;
  color: $primary-text;
  padding: 5px;
  margin: 5px;
  border: 1px solid $secondary-bg;
  border-radius: 5px;
  width: calc(50vw - 25px);
}

/* required class */
.my-editor {
  /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
  background: $primary-bg;
  color: $primary-text;

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
}

/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}

@media screen and (max-width: 1200px) {
  .editor-container {
    width: calc(100vw - 25px);
  }
}
</style>
