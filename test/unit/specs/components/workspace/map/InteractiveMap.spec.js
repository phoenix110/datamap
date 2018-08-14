import { destroyVM } from '../../../../util'
import { shallowMount } from '@vue/test-utils'
import InteractiveMap from 'components/workspace/map/interactive-map'

describe('InteractiveMap.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = shallowMount(InteractiveMap, {propsData: {cData: {config: {cards: []}, thumb: ""}, isDetailPg: true}})
    vm = wrapper.vm
    expect(wrapper.find(".interactive-map-show").exists()).to.be.true;
  })

})
