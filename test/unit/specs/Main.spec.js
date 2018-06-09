import Vue from 'vue'
import { destroyVM, createTest, createVue, triggerEvent} from '../util'
import tokenUtil from 'assets/js/utils/tokenUtil'
import Main from 'src/main.vue'

describe('Main.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    vm = createTest(Main, {}, true)
    expect(vm.$el.classList.contains("framework7-root"))
      .to.be.true
  })
  it('deviceready', done => {
    tokenUtil.set('TEST')
    window.device = {version: '6.0'}
    vm = createTest(Main, {}, true)
    vm.$device.android = true
    vm.isAndroid = true
    triggerEvent(document, 'deviceready')
    setTimeout(() => {
        triggerEvent(window, 'keyboardDidShow')
        done()
    })
  })
})
