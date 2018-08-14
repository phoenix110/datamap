import Vue from 'vue'
import { destroyVM } from '../../../util'
import { mount } from '@vue/test-utils'
import MoreDataPage from 'pages/dataUpload/more-data-page.vue'

describe('MoreDataPage.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(MoreDataPage, {mocks: {
        $f7Route: {
            context: {
                type: "detail"
            }
        }
    }, propsData: {imgList: [], pic: {}}})
    vm = wrapper.vm;
    expect(wrapper.find(".page-content").exists()).to.be.true;
  })
})
