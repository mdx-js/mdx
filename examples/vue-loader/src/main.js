import Vue from 'vue'
import HelloWorld from './hello-world.mdx'

Vue.config.productionTip = false

new Vue({
  render: h => h(HelloWorld)
}).$mount('#app')
