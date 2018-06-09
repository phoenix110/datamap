import { destroyVM } from '../../../../util'
import { mount } from '@vue/test-utils'
import InteractiveMap from 'components/workspace/map/interactive-map'

describe('InteractiveMap.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(InteractiveMap)
    vm = wrapper.vm
    expect(wrapper.find(".static-map-show").exists()).to.be.true;
  })

})
