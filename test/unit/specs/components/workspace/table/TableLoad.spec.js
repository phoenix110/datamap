import { destroyVM } from '../../../../util'
import { shallowMount } from '@vue/test-utils'
import TableLoad from 'components/workspace/table/table-load'

describe('TableLoad.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = shallowMount(TableLoad)
    vm = wrapper.vm
  })

  it('change cData should render content',() => {
    const wrapper = shallowMount(TableLoad)
    vm = wrapper.vm
    wrapper.setProps({cData: {}, viewLoaded: true})
    wrapper.setData({loaded: true});
    expect(wrapper.find(".content-area").exists()).to.be.true;
  })

})
