import Vue from 'vue'
import { destroyVM, createTest, createVue , triggerEvent} from '../../util'
import { mount } from '@vue/test-utils'
import pageList from 'src/mocker/pageList.json'
const getData = () => {
  return new Promise((resolve) => {
    resolve(pageList);
  })
}
const LazyLoadEchartsInjector = require('!!vue-loader?inject!components/lazyload-echarts.vue')
const LazyLoadEcharts = LazyLoadEchartsInjector({
  'src/assets/apis/pageList': {getData}
})

describe('LazyLoadEcharts.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(LazyLoadEcharts, {propsData:{selectPageIndex: 1,searchContent:""}}, true)
    vm = wrapper.vm
    wrapper.setProps({selectPageIndex: 0, searchContent: "c"});
  })
})
