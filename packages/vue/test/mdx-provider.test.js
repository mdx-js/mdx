import {mount} from '@vue/test-utils'
import {MDXProvider, MDXTag} from '../src'

const H1Tag = {
  render() {
    const data = {style: {color: 'green'}}
    return <h1 {...data}>{this.$slots.default}</h1>
  }
}

const Layout = {
  render() {
    return <div id="layout">{this.$slots.default}</div>
  }
}

it('Should allow components to be passed via context', () => {
  const components = {h1: H1Tag}
  const TestComponent = {
    render() {
      return (
        <MDXProvider components={components}>
          <MDXTag Layout={Layout} name="wrapper">
            <MDXTag name="h1">Hello World!</MDXTag>
          </MDXTag>
        </MDXProvider>
      )
    }
  }
  const wrapper = mount(TestComponent)
  expect(wrapper.html()).toMatch(/id="layout"/)
  expect(wrapper.html()).toMatch(/style="color: green;"/)
})
