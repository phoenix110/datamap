import Vue from 'vue'
import { destroyVM, createTest, createVue } from '../../../../../../util'
import { mount } from '@vue/test-utils'
import Slider from 'components/commons/card-panel/visual/normal/slider.vue'

describe('Slider.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(Slider, {propsData: {
        sliderMarksList: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
        value: 18,
        color: 0,
        min: 2,
        max: 30,
    }});
    vm = wrapper.vm;
    expect(wrapper.props().value).to.equal(18);
  })
})
