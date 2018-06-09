import Vue from 'vue'
import { destroyVM, createTest, createVue } from '../../util'
import { mount } from '@vue/test-utils'
import MyDataPage from 'pages/my-data-page.vue'

describe('MyDataPage.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(MyDataPage, {mocks: {
      $f7Route: {
          context: {
            prePage: "MapDrawPanel",
          }
      }
    }})
    vm = wrapper.vm;
    expect(wrapper.find('.page-content-list').exists()).to.be.true;
  })
})