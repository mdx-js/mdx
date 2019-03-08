import Vue from 'vue'

export default (type, props, children) => {
  console.log({type, props, children})

  return Vue.component('mdx-component', {
    render: function(createElement) {
      return createElement(type, props, children)
    }
  })
}
