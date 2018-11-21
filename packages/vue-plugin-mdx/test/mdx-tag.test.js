import {mount} from '@vue/test-utils'
import {MDXTag} from '../src'

const H1Tag = {
  render() {
    return <h1 style={{color: 'green'}}>{this.$slots.default}</h1>
  }
}

const Layout = {
  props: ['id'],
  render() {
    return <div id={this.id}>{this.$slots.default}</div>
  }
}

it('Should render the desired component', () => {
  const wrapper = mount(MDXTag, {
    propsData: {
      name: 'h1',
      components: {h1: H1Tag}
    },
    slots: {
      default: 'Hello World!'
    }
  })
  expect(wrapper.isVueInstance()).toBeTruthy()
  expect(wrapper.html()).toMatch(/style="color: green;"/)
})

it('Should render the Layout component', () => {
  const components = {h1: H1Tag}
  const MDXTagWithLayout = {
    render() {
      return (
        <MDXTag
          Layout={Layout}
          name={'wrapper'}
          components={components}
          layoutProps={{id: 'layout'}}
        >
          <MDXTag name="h1" components={components}>
            Hello World!
          </MDXTag>
        </MDXTag>
      )
    }
  }
  const wrapper = mount(MDXTagWithLayout)
  expect(wrapper.html()).toMatch(/id="layout"/)
  expect(wrapper.html()).toMatch(/style="color: green;"/)
})
