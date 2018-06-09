import { destroyVM } from '../../../../util'
import { mount } from '@vue/test-utils'
import DataBar from 'components/workspace/chart/data-bar'

describe('DataBar.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(DataBar)
    vm = wrapper.vm
    expect(wrapper.find(".chart_loading").text()).to.equal("努力加载中...");
  })

})
