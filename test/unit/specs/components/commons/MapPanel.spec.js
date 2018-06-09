import Vue from 'vue'
import { destroyVM, createTest, createVue } from '../../../util'
import { mount } from '@vue/test-utils'
import MapPanel from 'components/commons/map-panel'

describe('MapPanel.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(MapPanel, {propsData: {mapData: {test:""}},})
    vm = wrapper.vm;
    expect(wrapper.find('.layer-loading').text()).to.equal('努力加载中...');
    wrapper.setData({loaded: true});
    wrapper.setProps({ mapData: {test2:""}});
    expect(wrapper.findAll('.map_draw').length).to.equal(1)
  })
})
