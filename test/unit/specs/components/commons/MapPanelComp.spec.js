import Vue from 'vue'
import { destroyVM, createTest, createVue } from '../../../util'
import { mount } from '@vue/test-utils'
import MapPanelComp from 'components/commons/map-panel-comp.vue'

describe('MapPanelComp.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(MapPanelComp, {propsData: {
        mapProps: {
            map_id: 'map_panel_1',
            mapStyle: "amap://styles/light",
            mapCenter: [121.3866647443, 31.1500060413],
            zoom: 9,
            setMapCenter: [110.3866647443, 34.1500060413],
            setZoom: 4,
            zooms: [4, 18],
            scrollWheel: true,
            userLocation: true,
          },
          mapLoading: false,
    }})
    vm = wrapper.vm;
    expect(wrapper.find('.full_map').attributes().id).to.equal('map_panel_1');
  })
})
