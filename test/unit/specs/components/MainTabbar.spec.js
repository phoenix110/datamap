import Vue from 'vue'
import { destroyVM, createTest, createVue } from '../../util'
import MainTabbar from 'components/main-tabbar'

describe('MainTabbar.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    vm = createTest(MainTabbar, { selectedIndex: 1 }, true)
    expect(vm.$el.querySelector('.toolbar-inner .tab-link-active span').textContent)
      .to.equal('地图')
  })
})
