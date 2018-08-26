import { mount } from '@vue/test-utils';
import { MDXTag } from '../src';

const H1Tag = {
  render() {
    return <h1 style={{ color: 'tomato' }}>{this.$slots.default}</h1>
  }
};

it('Should render the desired component', () => {
  const wrapper = mount(MDXTag, { 
    propsData: {
      name: 'h1',
      components: { h1: H1Tag },
    },
    slots: {
      default: 'Hello World!'
    }
  });
  expect(wrapper.isVueInstance()).toBeTruthy();
})