import { destroyVM } from '../../../../util'
import { shallowMount } from '@vue/test-utils'
import HotTable from 'components/workspace/table/hot-table'

describe('HotTable.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = shallowMount(HotTable)
    vm = wrapper.vm
  })

  it('change cData should render content',() => {
    const wrapper = shallowMount(HotTable)
    vm = wrapper.vm
    wrapper.setProps({cData: {}, viewLoaded: true})
    wrapper.setData({loaded: true});
    expect(wrapper.find(".content-area").exists()).to.be.true;
  })

})
