import { destroyVM } from '../../../util'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import MapPanel from 'components/upload/map-panel'
const localVue = createLocalVue()

describe('MapPanel.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    AMap.Map.prototype.setZoomAndCenter = function() {}
    const wrapper = shallowMount(MapPanel, {
      localVue,
      propsData: {mapProps: {map_id: 'mapid',mapStyle: "light", zoom: 12, mapCenter: [121,31]}},
      mocks: {
        $f7Route: {
          context: {item: {}},
        }
      }
    })
    vm = wrapper.vm
    expect(wrapper.find(".map-panel-temp").exists()).to.be.true;
  })

})
