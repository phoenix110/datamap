import { destroyVM } from '../../../../util'
import { mount } from '@vue/test-utils'
import HotTable from 'components/workspace/table/hot-table'

describe('HotTable.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(HotTable)
    vm = wrapper.vm
    expect(wrapper.find(".chart_loading").text()).to.equal("努力加载中...");
  })

  it('change cData should render content',() => {
    const wrapper = mount(HotTable)
    vm = wrapper.vm
    wrapper.setProps({cData: {}})
    wrapper.setData({loaded: true});
    expect(wrapper.find(".content-area").exists()).to.be.true;
  })

})
