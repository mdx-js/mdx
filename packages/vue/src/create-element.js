import Vue from 'vue'

export default (type, props) => {
  console.log({type, props})

  // I don't know what I'm doing
  return Vue.component('mdx-component', {
    render: function(createElement) {
      return createElement('p', 'hiiiiiiiiiii')
    },
    props
  })
}
