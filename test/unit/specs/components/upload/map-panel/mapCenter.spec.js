import Vue from 'vue'
import { destroyVM, createTest, createVue } from '../../../../util'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import MapCenter from 'components/upload/normal/map-center'
const localVue = createLocalVue()

describe('MapCenter.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    AMap.Map.prototype.setZoomAndCenter = function() {}
    const wrapper = shallowMount(MapCenter, {
      localVue,
      propsData: {
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
          mapData: {},
          mapLoading: false,

      },
    })
    vm = wrapper.vm
    expect(wrapper.find(".map_center").exists()).to.be.true;
  })
})
