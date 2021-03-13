<template>
  <div id="app">
    <h1>Hello MDX</h1>
    <MDXProvider v-bind:components="components">
      <Test />
    </MDXProvider>
  </div>
</template>

<script>
import {MDXProvider} from '@mdx-js/vue-loader'
import HelloWorld from './components/HelloWorld'
import Test from './test.mdx'

export default {
  name: 'app',
  components: {
    Test,
    MDXProvider
  },
  data() {
    return {
      components: {
        section: props => HelloWorld,
        wrapper: props => 'article'
      }
    }
  }
}
</script>
