import Vue from 'vue'
import { destroyVM, createTest, createVue } from '../../../../util'
import MapCardPanel from 'components/commons/card-panel/map-card-panel'
import mapCardData from 'src/mocker/mapCardData.json'
import { shallowMount } from '@vue/test-utils'

describe('MapCardPanel.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = shallowMount(MapCardPanel, {propsData: {mapCardData, filterIndex: 0}})
    // vm = createTest(MapCardPanel, {iData: pageList.result[0].extra.configs[1].cards[2]}, true)
    vm = wrapper.vm;
    expect(vm.$el.querySelector('.title-content-text').textContent)
      .to.equal('上海 星巴克');
      // expect(wrapper.find(".title-content-text").exists()).to.be.true;
  })
})
