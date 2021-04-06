<template>
  <MDXProvider v-bind:components="mdxComponents">
    <Content />
  </MDXProvider>
</template>

<script>
import {MDXProvider} from '@mdx-js/vue'
import box from './Box.vue'
import Content from './content.mdx'

export default {
  name: 'app',
  components: {box, Content, MDXProvider},
  data() {
    return {
      mdxComponents: {box}
    }
  }
}
</script>
