import Vue from 'vue'
import { destroyVM, createTest, createVue } from '../../../util'
import MapCardPanel from 'components/commons/map-card-panel'
import pageList from 'src/mocker/pageList.json'

describe('MapCardPanel.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    vm = createTest(MapCardPanel, {iData: pageList.result[0].extra.configs[1].cards[2]}, true)
    expect(vm.$el.querySelector('.panel-title .text').textContent)
      .to.equal('衡山路板块,龙华板块,张江板块,陆家嘴板块,三林板块,新场板块,惠南板块,金汇板块,奉城板块')
  })
})
