import Vue from 'vue';
import { destroyVM } from '../../../util'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Upload from 'pages/home/upload'
const localVue = createLocalVue()

describe('Upload.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render', () => {
    const wrapper = shallowMount(Upload)
    vm = wrapper.vm
    expect(wrapper.find(".up-page-content").exists()).to.be.true;
  })

  it('emit pageAfterIn should show map', () => {
    const wrapper = shallowMount(Upload,{
      localVue,
      mocks: {
        $f7Route: {
          context: {}
        }
      }
    })
    vm = wrapper.vm
    const pageWrapper = wrapper.find(Vue.options.components.f7Page);
    expect(pageWrapper.exists()).to.be.true
    pageWrapper.vm.$emit("page:afterin");
    expect(vm.initmap).to.be.true;
  })

})
