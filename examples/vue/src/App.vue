<template>
  <div id="app">
    <h1>Hello MDX</h1>
    <Test />
  </div>
</template>

<script>
import Test from './test.mdx'

export default {
  name: 'app',
  components: {
    Test: Test
  }
}
</script>
