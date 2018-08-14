import { destroyVM } from '../../../../util'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import GeoPositionList from 'components/upload/normal/geo-position-list.vue'
const localVue = createLocalVue()

describe('GeoPositionList.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    AMap.Map.prototype.setZoomAndCenter = function() {}
    const wrapper = shallowMount(GeoPositionList, {
      propsData: {positionList: [], detailsList: [], listStatus: "omit"}})
    vm = wrapper.vm
    expect(wrapper.find(".geo-position-list").exists()).to.be.true;
  })

})
