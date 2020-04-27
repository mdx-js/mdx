import { shallowMount } from '@vue/test-utils'
import MDXProvider from '../src/mdx-provider'
import components from './mdx-components'

/**
 * Skipped because @vue/test-utils requires jsdom-global installed.
 * @todo Add unit test setup for vue components with @vue/test-utils or @testing-library/vue
 */
xdescribe('===== MDXProvider Component =====', () => {
  let mdxProvider
  const ChildComponent = {
    inject: ['$mdxComponents'],
    render: h => h('div', {})
  }

  it('should be a Vue component', () => {
    mdxProvider = shallowMount(MDXProvider, {
      slots: {
        default: [ChildComponent]
      }
    })
    expect(mdxProvider.isVueInstance()).toBeTruthy()
  })

  it('should provide mdx components object to child components', () => {
    mdxProvider = shallowMount(MDXProvider, {
      slots: {
        default: [ChildComponent]
      },
      propsData: {
        components,
      }
    })
    expect(mdxProvider.find(ChildComponent).vm.$mdxComponents()).toBe(components)
  })
})
