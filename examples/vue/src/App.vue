<template>
  <div id="app">
    <Test />
  </div>
</template>

<script>
import Test from './test.mdx'

console.log(Test)

export default {
  name: 'app',
  components: {
    Test: Test({})
  }
}
</script>
