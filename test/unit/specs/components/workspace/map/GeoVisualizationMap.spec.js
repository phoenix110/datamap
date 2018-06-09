import { destroyVM } from '../../../../util'
import { mount } from '@vue/test-utils'
import GeoVisualizationMap from 'components/workspace/map/geo-visualization-map'

describe('GeoVisualizationMap.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(GeoVisualizationMap)
    vm = wrapper.vm
    expect(wrapper.find(".static-map-show").exists()).to.be.true;
  })

})