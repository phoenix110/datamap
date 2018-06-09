import { destroyVM } from '../../../util'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import MapDrawPanel from 'components/upload/map-draw-panel.vue'
const localVue = createLocalVue()

describe('MapDrawPanel.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    AMap.Map.prototype.setZoomAndCenter = function() {}
    const wrapper = shallowMount(MapDrawPanel, {
      localVue,
      propsData: {mapProps: {map_id: 'mapid',mapStyle: "light", zoom: 12, mapCenter: [121,31]}},
      mocks: {
        $f7Route: {
          context: {item: {}},
        }
      },
      mapIns: {},
    })
    vm = wrapper.vm
    expect(wrapper.find(".map-draw-panel").exists()).to.be.true;
  })

})
