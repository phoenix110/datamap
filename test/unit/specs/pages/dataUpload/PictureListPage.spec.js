import Vue from 'vue'
import { destroyVM } from '../../../util'
import { mount } from '@vue/test-utils'
import PictureListPage from 'pages/dataUpload/more-data-page.vue'

describe('PictureListPage.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(PictureListPage, {mocks: {
        $f7Route: {
            context: {
                type: "detail"
            }
        }
    }})
    vm = wrapper.vm;
    expect(wrapper.find(".up-searchbar-comp").exists()).to.be.true;
  })
})
